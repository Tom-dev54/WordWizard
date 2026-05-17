import os
import time
import warnings
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

import numpy as np
import pandas as pd
import requests
import gradio as gr
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# ────────────────────────────────────────────────────────────────────────────
# DeepSeek AI via OpenAI-compatible SDK (NOT SparkAI)
# In Replit: Secrets panel → DEEPSEEK_API_KEY
# ────────────────────────────────────────────────────────────────────────────
from openai import OpenAI

warnings.filterwarnings("ignore")

_DEEPSEEK_KEY = os.getenv("DEEPSEEK_API_KEY", "")
_ai_client = (
    OpenAI(api_key=_DEEPSEEK_KEY, base_url="https://api.deepseek.com")
    if _DEEPSEEK_KEY else None
)

# ─── Constants ────────────────────────────────────────────────────────────────
BINANCE_SPOT    = "https://api.binance.com/api/v3"
BINANCE_FUTURES = "https://fapi.binance.com/fapi/v1"
BINANCE_FDATA   = "https://fapi.binance.com/futures/data"
FNG_URL         = "https://api.alternative.me/fng/"

KLINE_LIMIT     = 200
REQUEST_TIMEOUT = 8
CACHE_TTL       = 30

STOP_LOSS_PCT   = 0.02
TAKE_PROFIT_PCT = 0.05

POPULAR_PAIRS = [
    "BTCUSDT","ETHUSDT","BNBUSDT","SOLUSDT","XRPUSDT",
    "DOGEUSDT","ADAUSDT","AVAXUSDT","DOTUSDT","LINKUSDT",
    "MATICUSDT","LTCUSDT","UNIUSDT","ATOMUSDT","NEARUSDT",
    "AAVEUSDT","SHIBUSDT","ALGOUSDT","FILUSDT","APTUSDT",
]

TIMEFRAME_MAP = {
    "15分钟": "15m",
    "1小时":  "1h",
    "4小时":  "4h",
    "日线":   "1d",
}

_cache: dict = {}


def _cached(key, fn, ttl=CACHE_TTL):
    now = time.time()
    if key in _cache and now - _cache[key][1] < ttl:
        return _cache[key][0]
    result = fn()
    if result is not None:
        _cache[key] = (result, now)
    return result


# ─── Data Fetching ────────────────────────────────────────────────────────────

def _get(url, params=None):
    try:
        r = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
        r.raise_for_status()
        return r.json()
    except Exception:
        return None


def fetch_klines(symbol, interval):
    key = f"klines_{symbol}_{interval}"

    def _fetch():
        data = _get(
            f"{BINANCE_SPOT}/klines",
            {"symbol": symbol, "interval": interval, "limit": KLINE_LIMIT},
        )
        if not data:
            return None
        df = pd.DataFrame(data, columns=[
            "open_time","open","high","low","close","volume",
            "close_time","qvolume","trades","taker_buy_base","taker_buy_quote","ignore",
        ])
        for c in ["open","high","low","close","volume","qvolume"]:
            df[c] = pd.to_numeric(df[c], errors="coerce")
        df["datetime"] = pd.to_datetime(df["open_time"], unit="ms")
        return df[["datetime","open","high","low","close","volume","qvolume"]].reset_index(drop=True)

    return _cached(key, _fetch)


def fetch_ticker_24h(symbol):
    key = f"ticker_{symbol}"
    def _fetch():
        return _get(f"{BINANCE_SPOT}/ticker/24hr", {"symbol": symbol})
    return _cached(key, _fetch, ttl=15)


def fetch_all_tickers():
    def _fetch():
        return _get(f"{BINANCE_SPOT}/ticker/24hr")
    return _cached("all_tickers", _fetch, ttl=30)


def fetch_funding_rate(symbol):
    key = f"funding_{symbol}"
    def _fetch():
        data = _get(f"{BINANCE_FUTURES}/fundingRate", {"symbol": symbol, "limit": 1})
        if data and len(data) > 0:
            return float(data[0].get("fundingRate", 0))
        return None
    return _cached(key, _fetch, ttl=60)


def fetch_long_short_ratio(symbol):
    key = f"lsr_{symbol}"
    def _fetch():
        data = _get(
            f"{BINANCE_FDATA}/globalLongShortAccountRatio",
            {"symbol": symbol, "period": "1h", "limit": 1},
        )
        if data and len(data) > 0:
            return float(data[0].get("longShortRatio", 1.0))
        return None
    return _cached(key, _fetch, ttl=60)


def fetch_fear_greed():
    def _fetch():
        data = _get(FNG_URL, {"limit": 1})
        if data and "data" in data and len(data["data"]) > 0:
            d = data["data"][0]
            return {"value": int(d["value"]), "label": d["value_classification"]}
        return None
    return _cached("fng", _fetch, ttl=300)


# ─── Technical Indicators ─────────────────────────────────────────────────────

def calc_rsi(close, period=14):
    delta = close.diff()
    gain  = delta.clip(lower=0)
    loss  = (-delta).clip(lower=0)
    ag    = gain.ewm(com=period - 1, min_periods=period, adjust=False).mean()
    al    = loss.ewm(com=period - 1, min_periods=period, adjust=False).mean()
    rs    = ag / al.replace(0, np.nan)
    return 100 - (100 / (1 + rs))


def calc_macd(close, fast=12, slow=26, signal=9):
    ema_f    = close.ewm(span=fast,   adjust=False).mean()
    ema_s    = close.ewm(span=slow,   adjust=False).mean()
    macd     = ema_f - ema_s
    sig_line = macd.ewm(span=signal,  adjust=False).mean()
    return macd, sig_line, macd - sig_line


def calc_bb(close, period=20, std_dev=2.0):
    mid = close.rolling(period).mean()
    std = close.rolling(period).std(ddof=0)
    return mid + std_dev * std, mid, mid - std_dev * std


def calc_atr(df, period=14):
    hi, lo, cl = df["high"], df["low"], df["close"]
    prev_cl = cl.shift(1)
    tr = pd.concat([
        (hi - lo),
        (hi - prev_cl).abs(),
        (lo - prev_cl).abs(),
    ], axis=1).max(axis=1)
    return tr.rolling(period).mean()


def add_indicators(df):
    df = df.copy()
    close = df["close"]
    df["rsi"]                                    = calc_rsi(close)
    df["macd"], df["macd_sig"], df["macd_hist"]  = calc_macd(close)
    df["bb_upper"], df["bb_mid"], df["bb_lower"] = calc_bb(close)
    df["ema20"]    = close.ewm(span=20, adjust=False).mean()
    df["ema50"]    = close.ewm(span=50, adjust=False).mean()
    df["atr"]      = calc_atr(df)
    df["vol_ma10"] = df["volume"].rolling(10).mean()
    return df


# ─── Signal Generation ────────────────────────────────────────────────────────

def _empty_sig():
    return {
        "signal": "数据不足", "color": "#888", "direction": "观望",
        "win_rate": "N/A", "confidence": 0, "bull_score": 0, "bear_score": 0,
        "rsi": 50, "macd_hist": 0, "atr_pct": 0, "ema20": 0, "ema50": 0,
        "bb_upper": 0, "bb_lower": 0, "bb_mid": 0, "price": 0,
        "entry": 0, "stop_loss": 0, "take_profit": 0,
        "order_type": "观望", "limit_price": None, "is_long": False,
    }


def generate_signal(df):
    clean = df.dropna(subset=["rsi","macd","bb_upper","ema20","ema50","atr"])
    if len(clean) < 2:
        return _empty_sig()

    r, prev   = clean.iloc[-1], clean.iloc[-2]
    rsi       = r["rsi"]
    price     = r["close"]
    macd_hist = r["macd_hist"]
    prev_hist = prev["macd_hist"]
    bb_upper  = r["bb_upper"]
    bb_lower  = r["bb_lower"]
    bb_mid    = r["bb_mid"]
    ema20     = r["ema20"]
    ema50     = r["ema50"]
    atr_pct   = r["atr"] / price * 100

    macd_cross_up   = macd_hist > 0 and prev_hist <= 0
    macd_cross_down = macd_hist < 0 and prev_hist >= 0

    bull, bear = 0, 0

    if rsi < 30:   bull += 3
    elif rsi < 40: bull += 2
    elif rsi < 50: bull += 1
    if rsi > 70:   bear += 3
    elif rsi > 60: bear += 2
    elif rsi > 50: bear += 1

    if macd_cross_up:   bull += 3
    elif macd_hist > 0: bull += 1
    if macd_cross_down: bear += 3
    elif macd_hist < 0: bear += 1

    if ema20 > ema50:             bull += 2
    if ema20 < ema50:             bear += 2
    if price <= bb_lower * 1.01:  bull += 2
    if price >= bb_upper * 0.99:  bear += 2

    net = bull - bear

    if net >= 6:
        signal, color = "强烈买入 🚀", "#00d4aa"
        direction, win_rate = "开多 📈", "约 70%"
        confidence = min(95, 60 + net * 3)
    elif net >= 3:
        signal, color = "买入 📈", "#00d4aa"
        direction, win_rate = "开多 📈", "约 60%"
        confidence = min(80, 50 + net * 3)
    elif net <= -6:
        signal, color = "强烈卖出 🔻", "#ff4757"
        direction, win_rate = "开空 📉", "约 70%"
        confidence = min(95, 60 + abs(net) * 3)
    elif net <= -3:
        signal, color = "卖出 📉", "#ff4757"
        direction, win_rate = "开空 📉", "约 60%"
        confidence = min(80, 50 + abs(net) * 3)
    else:
        signal, color = "观望 ⏸", "#ffa502"
        direction, win_rate = "观望", "< 50%"
        confidence = 30

    is_long     = "多" in direction
    entry       = price
    stop_loss   = entry * (1 - STOP_LOSS_PCT)   if is_long else entry * (1 + STOP_LOSS_PCT)
    take_profit = entry * (1 + TAKE_PROFIT_PCT)  if is_long else entry * (1 - TAKE_PROFIT_PCT)
    order_type, limit_price = _order_type(price, bb_lower, bb_mid, ema20, is_long, net)

    return {
        "signal": signal, "color": color,
        "direction": direction, "win_rate": win_rate, "confidence": confidence,
        "price": price, "rsi": rsi, "macd_hist": macd_hist, "atr_pct": atr_pct,
        "ema20": ema20, "ema50": ema50,
        "bb_upper": bb_upper, "bb_lower": bb_lower, "bb_mid": bb_mid,
        "entry": entry, "stop_loss": stop_loss, "take_profit": take_profit,
        "order_type": order_type, "limit_price": limit_price,
        "bull_score": bull, "bear_score": bear, "is_long": is_long,
    }


def _order_type(price, bb_lower, bb_mid, ema20, is_long, net):
    if abs(net) >= 6:
        return "市价单（立即成交）", None
    if is_long:
        ideal = min(bb_lower, ema20) * 0.999
        if price > ideal * 1.005:
            return "挂单（等待回调）", ideal
        return "市价单（价格合适）", None
    else:
        ideal = max(bb_mid, ema20) * 1.001
        if price < ideal * 0.995:
            return "挂单（等待反弹）", ideal
        return "市价单（价格合适）", None


def calc_position(capital_u, sig, leverage):
    open_u    = round(min(capital_u * 0.3, capital_u * STOP_LOSS_PCT / STOP_LOSS_PCT), 1)
    open_u    = round(capital_u * 0.3, 1)
    nominal_u = open_u * leverage
    profit_u  = round(open_u * TAKE_PROFIT_PCT * leverage, 2)
    loss_u    = round(open_u * STOP_LOSS_PCT   * leverage, 2)
    return {"open_u": open_u, "leverage": leverage,
            "nominal_u": nominal_u, "profit_u": profit_u, "loss_u": loss_u}


def recommend_leverage(sig):
    atr_pct = sig.get("atr_pct", 2.0)
    net     = sig.get("bull_score", 0) - sig.get("bear_score", 0)
    if "观望" in sig["signal"]: return 1
    if atr_pct > 3:             return 2
    if abs(net) >= 6:           return min(5, int(4 + (abs(net) - 6) * 0.5))
    if abs(net) >= 3:           return 3
    return 2


# ─── Market Sentiment ─────────────────────────────────────────────────────────

def fetch_sentiment(symbol):
    fg  = fetch_fear_greed()
    fr  = fetch_funding_rate(symbol)
    lsr = fetch_long_short_ratio(symbol)

    fg_val   = fg["value"] if fg else 50
    fg_label = fg["label"] if fg else "中性"
    sent_bull, sent_bear = 0, 0

    if fg_val < 25:
        sent_bull += 2
    elif fg_val < 45:
        sent_bull += 1
    elif fg_val > 75:
        sent_bear += 2
    elif fg_val > 55:
        sent_bear += 1

    if fr is not None:
        if fr > 0.001:
            fr_label = f"{fr*100:.4f}%（多头付费）"
            sent_bear += 1
        elif fr < -0.0005:
            fr_label = f"{fr*100:.4f}%（空头付费）"
            sent_bull += 1
        else:
            fr_label = f"{fr*100:.4f}%（中性）"
    else:
        fr_label = "获取失败"

    if lsr is not None:
        if lsr > 1.2:
            lsr_label = f"{lsr:.2f}（多头占优）"
        elif lsr < 0.8:
            lsr_label = f"{lsr:.2f}（空头占优）"
            sent_bear += 1
        else:
            lsr_label = f"{lsr:.2f}（多空均衡）"
    else:
        lsr_label = "获取失败"

    net_sent = sent_bull - sent_bear
    if net_sent >= 2:    sent_overall = "偏多 📈"
    elif net_sent <= -2: sent_overall = "偏空 📉"
    else:                sent_overall = "中性 ➡️"

    return {
        "fg_val": fg_val, "fg_label": fg_label,
        "fr_label": fr_label, "lsr_label": lsr_label,
        "overall": sent_overall,
        "bull": sent_bull, "bear": sent_bear,
    }


# ─── AI Analysis ──────────────────────────────────────────────────────────────

def ai_analyze(symbol, sig, sentiment, capital_u, strategy):
    if _ai_client is None:
        return "（未配置 DEEPSEEK_API_KEY，AI 分析已跳过）"

    rsi_s  = "超卖" if sig["rsi"] < 30 else ("超买" if sig["rsi"] > 70 else "中性")
    macd_s = "多头金叉" if sig["macd_hist"] > 0 else "空头死叉"
    ema_s  = "多头排列" if sig["ema20"] > sig["ema50"] else "空头排列"

    prompt = f"""你是专业加密货币量化交易分析师，请根据以下实时数据用中文给出综合交易建议：

【币种】{symbol}  【当前价格】${sig['price']:,.4f}
【策略】{strategy}  【本金】{capital_u} USDT

【技术指标】
- RSI(14): {sig['rsi']:.1f}（{rsi_s}）
- MACD柱状图: {sig['macd_hist']:+.6f}（{macd_s}）
- EMA20/EMA50: {ema_s}
- 布林带: 上轨${sig['bb_upper']:,.2f} / 下轨${sig['bb_lower']:,.2f}
- ATR波动率: {sig['atr_pct']:.2f}%

【市场情绪】
- 恐惧贪婪指数: {sentiment['fg_val']}（{sentiment['fg_label']}）
- 资金费率: {sentiment['fr_label']}
- 多空比: {sentiment['lsr_label']}
- 综合情绪: {sentiment['overall']}

【规则信号】{sig['signal']}，建议{sig['direction']}，胜率{sig['win_rate']}

请给出（不超过180字）：
1. 综合判断（开多/开空/观望）和核心理由
2. 最优入场方式（市价/挂单及价格）
3. 止损止盈建议
4. 杠杆倍数建议
5. 最需要注意的一个风险点"""

    try:
        resp = _ai_client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=400,
            temperature=0.3,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        return f"AI 分析请求失败：{e}"


# ─── Market Scanner ───────────────────────────────────────────────────────────

def scan_market(strategy="快进快出"):
    tickers = fetch_all_tickers()
    if not tickers:
        return {"热门榜": [], "涨幅榜": [], "跌幅榜": [], "快进快出榜": []}

    usdt = [t for t in tickers
            if t.get("symbol","").endswith("USDT")
            and float(t.get("quoteVolume","0")) > 1_000_000]

    def to_row(t):
        hi  = float(t["highPrice"])
        lo  = float(t["lowPrice"])
        mid = (hi + lo) / 2 or 1
        return {
            "symbol": t["symbol"],
            "price":  float(t["lastPrice"]),
            "change": float(t["priceChangePercent"]),
            "volume": float(t["quoteVolume"]),
            "spread": (hi - lo) / mid * 100,
        }

    rows  = [to_row(t) for t in usdt]
    hot   = sorted(rows, key=lambda x: x["volume"],  reverse=True)[:5]
    up    = sorted([r for r in rows if r["change"] >  3], key=lambda x: x["change"], reverse=True)[:5]
    down  = sorted([r for r in rows if r["change"] < -3], key=lambda x: x["change"])[:5]
    scalp = sorted(rows, key=lambda x: x["spread"] * x["volume"], reverse=True)[:5]
    return {"热门榜": hot, "涨幅榜": up, "跌幅榜": down, "快进快出榜": scalp}


# ─── Auto Coin Selection ──────────────────────────────────────────────────────

def _scan_single(sym, interval, tickers_map, strategy, capital_u):
    try:
        df = fetch_klines(sym, interval)
        if df is None or len(df) < 60:
            return None
        df  = add_indicators(df)
        sig = generate_signal(df)

        if "数据不足" in sig["signal"] or "观望" in sig["signal"]:
            return None

        net   = sig["bull_score"] - sig["bear_score"]
        score = sig["confidence"] + abs(net) * 5

        t       = tickers_map.get(sym, {})
        vol_24h = float(t.get("quoteVolume", 0))
        chg_24h = float(t.get("priceChangePercent", 0))
        hi      = float(t.get("highPrice", sig["price"]))
        lo      = float(t.get("lowPrice",  sig["price"]))
        spread  = (hi - lo) / ((hi + lo) / 2 or 1) * 100

        if strategy == "快进快出":
            score += spread * 8
        elif strategy == "趋势交易" and abs(chg_24h) > 3:
            score += 15

        if capital_u < 200 and sig["price"] > 5000:
            score -= 20

        return {
            "symbol":     sym,
            "signal":     sig["signal"],
            "direction":  sig["direction"],
            "win_rate":   sig["win_rate"],
            "confidence": sig["confidence"],
            "score":      score,
            "price":      sig["price"],
            "change":     chg_24h,
            "vol":        vol_24h,
            "spread":     spread,
            "is_long":    sig["is_long"],
        }
    except Exception:
        return None


def auto_select_coin(capital_u=100, strategy="快进快出", interval="1h"):
    tickers = fetch_all_tickers()
    if not tickers:
        return []

    usdt = [t for t in tickers
            if t.get("symbol","").endswith("USDT")
            and float(t.get("quoteVolume", 0)) > 30_000_000]
    usdt.sort(key=lambda x: float(x["quoteVolume"]), reverse=True)
    scan_syms   = [t["symbol"] for t in usdt[:20]]
    tickers_map = {t["symbol"]: t for t in usdt}

    results = []
    with ThreadPoolExecutor(max_workers=6) as ex:
        futures = {
            ex.submit(_scan_single, sym, interval, tickers_map, strategy, capital_u): sym
            for sym in scan_syms
        }
        for fut in as_completed(futures):
            r = fut.result()
            if r:
                results.append(r)

    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:3]


# ─── Plotly Interactive Chart ─────────────────────────────────────────────────

def build_plotly_chart(df, symbol):
    try:
        df_plot = df.dropna(subset=["rsi","macd"]).tail(100).copy().reset_index(drop=True)
        if len(df_plot) < 5:
            return None

        fig = make_subplots(
            rows=3, cols=1, shared_xaxes=True,
            vertical_spacing=0.02,
            row_heights=[0.58, 0.20, 0.22],
        )

        # ── Candlestick ──
        fig.add_trace(go.Candlestick(
            x=df_plot["datetime"],
            open=df_plot["open"], high=df_plot["high"],
            low=df_plot["low"],   close=df_plot["close"],
            name="K线",
            increasing=dict(line=dict(color="#00d4aa", width=1), fillcolor="#00d4aa"),
            decreasing=dict(line=dict(color="#ff4757", width=1), fillcolor="#ff4757"),
        ), row=1, col=1)

        # BB fill between upper and lower
        fig.add_trace(go.Scatter(
            x=df_plot["datetime"], y=df_plot["bb_upper"],
            line=dict(color="rgba(74,158,255,0.4)", width=1, dash="dot"),
            name="BB上轨", showlegend=False,
        ), row=1, col=1)
        fig.add_trace(go.Scatter(
            x=df_plot["datetime"], y=df_plot["bb_lower"],
            line=dict(color="rgba(74,158,255,0.4)", width=1, dash="dot"),
            fill="tonexty", fillcolor="rgba(74,158,255,0.04)",
            name="BB区间", showlegend=False,
        ), row=1, col=1)
        fig.add_trace(go.Scatter(
            x=df_plot["datetime"], y=df_plot["bb_mid"],
            line=dict(color="rgba(74,158,255,0.25)", width=0.8),
            name="BB中轨", showlegend=False,
        ), row=1, col=1)

        fig.add_trace(go.Scatter(
            x=df_plot["datetime"], y=df_plot["ema20"],
            line=dict(color="#f5a623", width=1.5), name="EMA20",
        ), row=1, col=1)
        fig.add_trace(go.Scatter(
            x=df_plot["datetime"], y=df_plot["ema50"],
            line=dict(color="#a855f7", width=1.5), name="EMA50",
        ), row=1, col=1)

        # ── Volume ──
        vol_colors = [
            "#00d4aa" if df_plot["close"].iloc[i] >= df_plot["open"].iloc[i] else "#ff4757"
            for i in range(len(df_plot))
        ]
        fig.add_trace(go.Bar(
            x=df_plot["datetime"], y=df_plot["volume"],
            marker_color=vol_colors, marker_opacity=0.65,
            name="成交量", showlegend=False,
        ), row=2, col=1)
        fig.add_trace(go.Scatter(
            x=df_plot["datetime"], y=df_plot["vol_ma10"],
            line=dict(color="#f5a623", width=1),
            name="VolMA10", showlegend=False,
        ), row=2, col=1)

        # ── RSI ──
        fig.add_trace(go.Scatter(
            x=df_plot["datetime"], y=df_plot["rsi"],
            line=dict(color="#a855f7", width=1.5),
            fill="tozeroy", fillcolor="rgba(168,85,247,0.05)",
            name="RSI", showlegend=False,
        ), row=3, col=1)
        fig.add_hrect(y0=70, y1=100, fillcolor="rgba(255,71,87,0.07)", line_width=0, row=3, col=1)
        fig.add_hrect(y0=0,  y1=30,  fillcolor="rgba(0,212,170,0.07)", line_width=0, row=3, col=1)
        for level, col in [(70, "#ff4757"), (30, "#00d4aa"), (50, "#333")]:
            fig.add_hline(y=level, line=dict(color=col, width=0.8, dash="dot"), row=3, col=1)

        last_price = df_plot["close"].iloc[-1]
        fig.update_layout(
            template="plotly_dark",
            paper_bgcolor="#07070c",
            plot_bgcolor="#0d0d14",
            height=500,
            xaxis_rangeslider_visible=False,
            font=dict(color="#666", size=10),
            margin=dict(l=50, r=8, t=40, b=8),
            legend=dict(
                orientation="h", yanchor="bottom", y=1.01, xanchor="left", x=0,
                font=dict(size=9, color="#777"), bgcolor="rgba(0,0,0,0)", borderwidth=0,
            ),
            title=dict(
                text=(f"<b><span style='color:white'>{symbol}</span></b>"
                      f"  <span style='color:#555'>${last_price:,.4f}</span>"),
                font=dict(size=12), x=0.01, xanchor="left",
            ),
            hovermode="x unified",
            hoverlabel=dict(bgcolor="#111118", font_size=11, bordercolor="rgba(255,255,255,0.1)"),
        )

        ax = dict(gridcolor="rgba(255,255,255,0.04)", showline=False, zeroline=False)
        for i in range(1, 4):
            fig.update_xaxes(**ax, row=i, col=1)
            fig.update_yaxes(**ax, row=i, col=1)
        fig.update_yaxes(range=[0, 100], row=3, col=1)
        fig.update_yaxes(title_text="Price", title_font=dict(size=9, color="#444"), row=1, col=1)
        fig.update_yaxes(title_text="Vol",   title_font=dict(size=9, color="#444"), row=2, col=1)
        fig.update_yaxes(title_text="RSI",   title_font=dict(size=9, color="#444"), row=3, col=1)

        return fig
    except Exception as e:
        print(f"Chart error: {e}")
        return None


# ─── HTML / Card Builders ─────────────────────────────────────────────────────

def _fmt(price):
    if price >= 1000: return f"${price:,.2f}"
    if price >= 1:    return f"${price:.4f}"
    return f"${price:.6f}"


def _glass(title, body, accent="#6c63ff"):
    return (
        f'<div style="background:rgba(255,255,255,0.025);'
        f'border:1px solid rgba(255,255,255,0.07);'
        f'border-top:2px solid {accent};'
        f'border-radius:18px;padding:16px 14px;margin:5px 0;">'
        f'<div style="font-size:10px;color:#555;letter-spacing:1.5px;'
        f'text-transform:uppercase;margin-bottom:10px;font-weight:500">{title}</div>'
        f'{body}</div>'
    )


def build_auto_recs_html(recs):
    if not recs:
        return _glass(
            "🎯 AI 智能选币推荐",
            '<div style="color:#555;font-size:13px;padding:14px 0;text-align:center">'
            '当前市场无强方向信号，建议观望</div>',
            "#444",
        )

    medals = ["🥇", "🥈", "🥉"]
    items  = ""
    for i, r in enumerate(recs):
        rgb     = "0,212,170" if r["is_long"] else "255,71,87"
        accent  = f"rgb({rgb})"
        dir_txt = "开多 📈" if r["is_long"] else "开空 📉"
        chg_c   = "#00d4aa" if r["change"] >= 0 else "#ff4757"

        items += (
            f'<div style="display:flex;align-items:center;gap:12px;'
            f'padding:12px 14px;margin:6px 0;'
            f'background:rgba({rgb},0.07);'
            f'border:1px solid rgba({rgb},0.2);'
            f'border-radius:14px;">'
            f'<div style="font-size:26px;flex-shrink:0">{medals[i]}</div>'
            f'<div style="flex:1;min-width:0">'
            f'<div style="font-size:17px;font-weight:700;color:white;letter-spacing:0.3px">'
            f'{r["symbol"]}</div>'
            f'<div style="font-size:11px;color:#555;margin-top:3px">'
            f'<span style="color:{chg_c}">{r["change"]:+.2f}%</span>'
            f'&nbsp;·&nbsp;成交 ${r["vol"]/1e6:.0f}M'
            f'&nbsp;·&nbsp;置信 {r["confidence"]}%</div>'
            f'</div>'
            f'<div style="text-align:right;flex-shrink:0">'
            f'<div style="font-size:13px;font-weight:700;color:{accent}">{r["signal"]}</div>'
            f'<div style="font-size:12px;color:{accent};margin-top:3px">{dir_txt}</div>'
            f'<div style="font-size:11px;color:#444;margin-top:2px">{r["win_rate"]}</div>'
            f'</div></div>'
        )

    return _glass("🎯 AI 智能选币推荐", items, "#6c63ff")


def build_price_html(ticker, sig):
    price     = sig["price"]
    chg       = float(ticker["priceChangePercent"]) if ticker else 0
    hi        = float(ticker["highPrice"])           if ticker else 0
    lo        = float(ticker["lowPrice"])            if ticker else 0
    chg_color = "#00d4aa" if chg >= 0 else "#ff4757"
    arrow     = "▲" if chg >= 0 else "▼"

    body = (
        f'<div style="font-size:28px;font-weight:800;color:white;letter-spacing:-0.5px;line-height:1.1">'
        f'{_fmt(price)}</div>'
        f'<div style="font-size:16px;color:{chg_color};margin-top:6px;font-weight:600">'
        f'{arrow} {chg:+.2f}%</div>'
        f'<div style="display:flex;gap:14px;margin-top:8px;font-size:11px;color:#444">'
        f'<span>高&nbsp;<span style="color:#777">{_fmt(hi)}</span></span>'
        f'<span>低&nbsp;<span style="color:#777">{_fmt(lo)}</span></span>'
        f'</div>'
    )
    return _glass("当前价格", body, "#4a9eff")


def build_signal_html(sig):
    s = sig["signal"]
    if   "强烈买入" in s: color, bg = "#00d4aa", "rgba(0,212,170,0.10)"
    elif "买入"     in s: color, bg = "#00d4aa", "rgba(0,212,170,0.06)"
    elif "强烈卖出" in s: color, bg = "#ff4757", "rgba(255,71,87,0.10)"
    elif "卖出"     in s: color, bg = "#ff4757", "rgba(255,71,87,0.06)"
    else:                 color, bg = "#ffa502", "rgba(255,165,2,0.06)"

    body = (
        f'<div style="background:{bg};border-radius:12px;padding:12px;text-align:center">'
        f'<div style="font-size:19px;font-weight:800;color:{color}">{s}</div>'
        f'<div style="font-size:13px;color:{color};margin-top:5px;opacity:0.85">'
        f'{sig["direction"]}</div>'
        f'<div style="font-size:11px;color:#444;margin-top:4px">'
        f'胜率 {sig["win_rate"]} · 置信 {sig["confidence"]}%</div>'
        f'</div>'
    )
    return _glass("交易信号", body, color)


def build_rec_html(sig, pos, leverage):
    order = sig["order_type"]
    if sig["limit_price"]:
        order += f' @ {_fmt(sig["limit_price"])}'

    def _row(icon, label, val, col="#ccc"):
        return (f'<tr><td style="padding:6px 0;color:#555;white-space:nowrap;font-size:12px">'
                f'{icon}&nbsp;{label}</td>'
                f'<td style="padding:6px 0 6px 10px;color:{col};font-weight:600;font-size:12px">'
                f'{val}</td></tr>')

    table = (
        '<table style="width:100%;border-collapse:collapse">'
        + _row("📌", "入场方式", order)
        + _row("💰", "建议仓位", f'{pos["open_u"]}U（×{leverage} = {pos["nominal_u"]:.0f}U）')
        + _row("🛡", "止损价",   f'{_fmt(sig["stop_loss"])}（−{pos["loss_u"]}U）', "#ff4757")
        + _row("🎯", "止盈价",   f'{_fmt(sig["take_profit"])}（+{pos["profit_u"]}U）', "#00d4aa")
        + _row("⚡", "杠杆建议", f'{leverage}倍（新手建议 ≤ 3倍）')
        + "</table>"
    )
    return _glass("操作建议", table, "#6c63ff")


def build_indicators_html(sig, sentiment):
    rsi = sig["rsi"]
    rc  = "#ff4757" if rsi > 70 else ("#00d4aa" if rsi < 30 else "#ffa502")
    rl  = "超买" if rsi > 70 else ("超卖" if rsi < 30 else "中性")
    mc  = "#00d4aa" if sig["macd_hist"] > 0 else "#ff4757"
    ml  = "多头" if sig["macd_hist"] > 0 else "空头"
    ec  = "#00d4aa" if sig["ema20"] > sig["ema50"] else "#ff4757"
    el  = "多头排列" if sig["ema20"] > sig["ema50"] else "空头排列"

    def mini(lbl, val, sub, c):
        return (
            f'<div style="flex:1;min-width:60px;background:rgba(255,255,255,0.03);'
            f'border-radius:12px;padding:10px 6px;text-align:center">'
            f'<div style="font-size:9px;color:#444;margin-bottom:4px;letter-spacing:0.5px">{lbl}</div>'
            f'<div style="font-size:16px;font-weight:700;color:{c}">{val}</div>'
            f'<div style="font-size:9px;color:{c};margin-top:3px;opacity:0.75">{sub}</div>'
            f'</div>'
        )

    fg_col = "#00d4aa" if sentiment["fg_val"] < 40 else ("#ff4757" if sentiment["fg_val"] > 60 else "#ffa502")

    body = (
        f'<div style="display:flex;gap:5px;flex-wrap:nowrap">'
        + mini("RSI(14)",  f'{rsi:.0f}',  rl, rc)
        + mini("MACD",     ml,            f'{sig["macd_hist"]:+.4f}'[:7], mc)
        + mini("均线",     el[:2],        el[2:], ec)
        + mini("波动率",   f'{sig["atr_pct"]:.1f}%', "ATR", "#777")
        + mini("恐惧贪婪", str(sentiment["fg_val"]), sentiment["fg_label"][:2], fg_col)
        + "</div>"
    )
    return _glass("技术指标 & 情绪速览", body, "#333")


def build_sentiment_html(sentiment):
    fg      = sentiment["fg_val"]
    bar_col = "#00d4aa" if fg < 40 else ("#ff4757" if fg > 60 else "#ffa502")

    body = (
        f'<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">'
        f'<span style="font-size:28px;font-weight:800;color:{bar_col}">{fg}</span>'
        f'<div><div style="font-size:13px;color:{bar_col};font-weight:600">'
        f'{sentiment["fg_label"]}</div>'
        f'<div style="font-size:10px;color:#444">恐惧贪婪指数 / 100</div></div></div>'
        f'<div style="background:#111;border-radius:6px;height:5px;margin-bottom:12px;overflow:hidden">'
        f'<div style="background:{bar_col};width:{fg}%;height:100%;border-radius:6px"></div></div>'
        f'<div style="font-size:11px;color:#555;line-height:2">'
        f'资金费率：<span style="color:#888">{sentiment["fr_label"]}</span><br>'
        f'多空比：<span style="color:#888">{sentiment["lsr_label"]}</span><br>'
        f'综合情绪：<span style="color:#ffa502;font-weight:600">{sentiment["overall"]}</span>'
        f'</div>'
    )
    return _glass("市场情绪", body, bar_col)


def build_scan_html(market):
    def section(title, coins):
        rows = ""
        for c in coins:
            cc = "#00d4aa" if c["change"] >= 0 else "#ff4757"
            rows += (
                f'<tr style="border-bottom:1px solid rgba(255,255,255,0.04)">'
                f'<td style="padding:5px 0;color:#ccc;font-size:12px;font-weight:500">'
                f'{c["symbol"]}</td>'
                f'<td style="padding:5px 0;color:{cc};font-size:12px;text-align:right">'
                f'{c["change"]:+.2f}%</td>'
                f'<td style="padding:5px 0;color:#444;font-size:11px;text-align:right">'
                f'${c["volume"]/1e6:.0f}M</td></tr>'
            )
        if not rows:
            rows = '<tr><td colspan="3" style="color:#444;padding:5px 0;font-size:11px">暂无</td></tr>'
        return (
            f'<div style="flex:1;min-width:130px">'
            f'<div style="font-size:10px;color:#444;margin-bottom:6px;letter-spacing:0.5px">{title}</div>'
            f'<table style="width:100%;border-collapse:collapse">{rows}</table></div>'
        )

    body = (
        f'<div style="display:flex;flex-wrap:wrap;gap:16px">'
        + section("🔥 热门", market["热门榜"])
        + section("📈 涨幅", market["涨幅榜"])
        + section("📉 跌幅", market["跌幅榜"])
        + section("⚡ 快进快出", market["快进快出榜"])
        + "</div>"
    )
    return _glass("市场扫描总览", body, "#333")


def build_ai_html(ai_text):
    body = (
        f'<div style="font-size:13px;color:#bbb;line-height:1.9;white-space:pre-wrap">'
        f'{ai_text}</div>'
    )
    return _glass("🤖 AI 智能分析引擎", body, "#7c3aed")


# ─── Orchestrators ────────────────────────────────────────────────────────────

def run_auto_select(capital_u, strategy, timeframe_label):
    interval  = TIMEFRAME_MAP.get(timeframe_label, "1h")
    recs      = auto_select_coin(float(capital_u), strategy, interval)
    recs_html = build_auto_recs_html(recs)
    best      = recs[0]["symbol"] if recs else "BTCUSDT"
    return recs_html, best


def run_analysis(selected_coin, timeframe_label, capital_u, strategy):
    interval = TIMEFRAME_MAP.get(timeframe_label, "1h")
    symbol   = (selected_coin or "BTCUSDT").strip().upper()
    ts       = (f'<div style="font-size:10px;color:#333;padding:3px 2px">'
                f'⏱ {symbol} · {datetime.now().strftime("%H:%M:%S")} · Binance</div>')

    def _err(msg):
        e = f'<div style="color:#ff4757;font-size:13px;padding:10px">{msg}</div>'
        return e, e, e, e, e, None, e, e, ts

    df = fetch_klines(symbol, interval)
    if df is None or len(df) < 60:
        return _err(f"❌ 数据获取失败（{symbol}），请检查网络或稍后重试")

    df        = add_indicators(df)
    sig       = generate_signal(df)
    leverage  = recommend_leverage(sig)
    pos       = calc_position(float(capital_u), sig, leverage)
    ticker    = fetch_ticker_24h(symbol)
    sentiment = fetch_sentiment(symbol)
    market    = scan_market(strategy)
    ai_text   = ai_analyze(symbol, sig, sentiment, float(capital_u), strategy)
    chart     = build_plotly_chart(df, symbol)

    return (
        build_price_html(ticker, sig),
        build_signal_html(sig),
        build_rec_html(sig, pos, leverage),
        build_indicators_html(sig, sentiment),
        build_sentiment_html(sentiment),
        chart,
        build_scan_html(market),
        build_ai_html(ai_text),
        ts,
    )


# ─── Gradio UI ────────────────────────────────────────────────────────────────

CSS = """
body, .gradio-container, .app { background:#07070c !important; }
.main { padding:10px !important; }
footer, [data-testid="footer"], .built-with { display:none !important; }

.block { background:transparent !important; border:none !important; box-shadow:none !important; }
.form, .panel, .wrap, .container { background:transparent !important; }

/* Inputs */
input, select, textarea,
.svelte-i3tvor input, .svelte-i3tvor select {
    background:rgba(255,255,255,0.06) !important;
    border:1px solid rgba(255,255,255,0.1) !important;
    border-radius:12px !important;
    color:white !important;
    font-size:14px !important;
}
label span, .svelte-1b6s6s { color:#555 !important; font-size:11px !important; }

/* Primary button — gradient */
button.primary, button[data-testid="primary"] {
    background: linear-gradient(135deg, #6c63ff 0%, #a855f7 100%) !important;
    border:none !important;
    border-radius:14px !important;
    font-size:16px !important;
    font-weight:700 !important;
    letter-spacing:0.3px !important;
    box-shadow:0 4px 20px rgba(108,99,255,0.3) !important;
    transition:all 0.2s ease !important;
    color:white !important;
}
button.primary:active {
    transform:scale(0.97) !important;
    box-shadow:0 2px 10px rgba(108,99,255,0.2) !important;
}

/* Secondary / scan button */
button.secondary, button[data-testid="secondary"] {
    background:rgba(255,255,255,0.05) !important;
    border:1px solid rgba(255,255,255,0.1) !important;
    border-radius:10px !important;
    color:#888 !important;
    font-size:13px !important;
}

/* Accordion */
details, .accordion {
    background:rgba(255,255,255,0.02) !important;
    border:1px solid rgba(255,255,255,0.06) !important;
    border-radius:14px !important;
}

/* Plot bg */
.plot-container { background:transparent !important; border:none !important; }
"""

THEME = gr.themes.Base(primary_hue=gr.themes.colors.violet).set(
    body_background_fill="#07070c",
    body_background_fill_dark="#07070c",
    background_fill_primary="#0d0d14",
    background_fill_primary_dark="#0d0d14",
    background_fill_secondary="#111118",
    background_fill_secondary_dark="#111118",
    border_color_primary="rgba(255,255,255,0.08)",
    border_color_primary_dark="rgba(255,255,255,0.08)",
    color_accent="#6c63ff",
    color_accent_soft="rgba(108,99,255,0.15)",
    color_accent_soft_dark="rgba(108,99,255,0.15)",
)

HEADER_HTML = """
<div style="padding:14px 2px 6px">
  <div style="font-size:21px;font-weight:800;color:white;letter-spacing:-0.5px">
    🚀 加密货币智能交易分析器
  </div>
  <div style="font-size:11px;color:#333;margin-top:3px;letter-spacing:0.5px">
    实时行情 · 技术指标 · 市场情绪 · AI 智能分析 · Binance
  </div>
</div>"""

RISK_HTML = """
<div style="background:rgba(255,50,50,0.07);border:1px solid rgba(255,50,50,0.18);
border-radius:12px;padding:9px 14px;margin-bottom:4px;font-size:11px;
color:#cc6666;line-height:1.5">
⚠️ <b>风险警告</b>：本工具仅供参考，不构成投资建议。加密货币交易有极高风险，
杠杆交易可能导致超额亏损，您可能损失全部本金。请只投入您能承受损失的资金。
</div>"""

with gr.Blocks(title="🚀 加密货币智能交易分析器", css=CSS, theme=THEME) as demo:

    gr.HTML(HEADER_HTML)
    gr.HTML(RISK_HTML)

    # ── AI auto-recommendations (updated by scan) ──
    html_recs     = gr.HTML()
    selected_coin = gr.Textbox(value="BTCUSDT", visible=False, label="分析币种")

    # ── Settings row ──
    with gr.Row():
        num_capital = gr.Number(value=100, label="本金 USDT", minimum=10, scale=2)
        dd_strategy = gr.Dropdown(
            choices=["快进快出", "趋势交易"], value="快进快出",
            label="策略", scale=2,
        )
        dd_tf = gr.Dropdown(
            choices=list(TIMEFRAME_MAP.keys()), value="1小时",
            label="时间周期", scale=2,
        )
        btn_scan = gr.Button("🔄 重新扫描", scale=1, size="sm", variant="secondary")

    with gr.Accordion("📌 手动指定币种（可选，覆盖AI推荐）", open=False):
        with gr.Row():
            dd_symbol      = gr.Dropdown(choices=POPULAR_PAIRS, value="BTCUSDT",
                                         label="交易对", scale=5)
            btn_use_manual = gr.Button("用此币分析 →", variant="secondary", scale=1, size="sm")

    btn_analyze = gr.Button("🚀 深度分析", variant="primary", size="lg")
    ts_html     = gr.HTML()

    # ── Results ──
    with gr.Row(equal_height=True):
        html_price  = gr.HTML(scale=1)
        html_signal = gr.HTML(scale=1)
        html_rec    = gr.HTML(scale=2)

    html_indic = gr.HTML()
    html_sent  = gr.HTML()
    plot_chart = gr.Plot(label="", show_label=False)
    html_scan  = gr.HTML()
    html_ai    = gr.HTML()

    # ── Event wiring ──
    scan_ins  = [num_capital, dd_strategy, dd_tf]
    scan_outs = [html_recs, selected_coin]

    ana_ins  = [selected_coin, dd_tf, num_capital, dd_strategy]
    ana_outs = [html_price, html_signal, html_rec, html_indic,
                html_sent, plot_chart, html_scan, html_ai, ts_html]

    btn_scan.click(fn=run_auto_select, inputs=scan_ins, outputs=scan_outs)
    btn_use_manual.click(fn=lambda s: s, inputs=[dd_symbol], outputs=[selected_coin])
    btn_analyze.click(fn=run_analysis, inputs=ana_ins, outputs=ana_outs)

    # Page load: scan first, then analyze top pick
    demo.load(fn=run_auto_select, inputs=scan_ins, outputs=scan_outs).then(
        fn=run_analysis, inputs=ana_ins, outputs=ana_outs,
    )

    # Auto-refresh every 90 seconds
    try:
        timer = gr.Timer(value=90)
        timer.tick(fn=run_auto_select, inputs=scan_ins, outputs=scan_outs).then(
            fn=run_analysis, inputs=ana_ins, outputs=ana_outs,
        )
    except Exception:
        pass


if __name__ == "__main__":
    _share = os.environ.get("GRADIO_SHARE", "false").lower() == "true"
    _port  = int(os.environ.get("GRADIO_SERVER_PORT", "7861"))
    demo.queue().launch(
        server_name="0.0.0.0",
        server_port=_port,
        share=_share,
        show_error=True,
    )
