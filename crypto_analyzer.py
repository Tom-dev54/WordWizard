import os
import time
import warnings
from datetime import datetime

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import matplotlib.patches as mpatches
from matplotlib.patches import Rectangle

import numpy as np
import pandas as pd
import requests
import gradio as gr

# ──────────────────────────────────────────────────────────────────────────────
# DeepSeek AI 接入方式说明：
#   DeepSeek 兼容 OpenAI SDK，只需改 base_url 即可，不需要任何 SparkAI 包。
#   在 Replit 中：左侧 Secrets 添加 DEEPSEEK_API_KEY，程序自动读取。
# ──────────────────────────────────────────────────────────────────────────────
from openai import OpenAI

warnings.filterwarnings('ignore')

# ─── DeepSeek AI ──────────────────────────────────────────────────────────────
_DEEPSEEK_KEY = os.getenv("DEEPSEEK_API_KEY", "")
_ai_client = OpenAI(api_key=_DEEPSEEK_KEY, base_url="https://api.deepseek.com") if _DEEPSEEK_KEY else None

# ─── Constants ────────────────────────────────────────────────────────────────
BINANCE_SPOT    = "https://api.binance.com/api/v3"
BINANCE_FUTURES = "https://fapi.binance.com/fapi/v1"
BINANCE_FDATA   = "https://fapi.binance.com/futures/data"
FNG_URL         = "https://api.alternative.me/fng/"

KLINE_LIMIT   = 200
REQUEST_TIMEOUT = 8
CACHE_TTL     = 30   # seconds

STOP_LOSS_PCT   = 0.02
TAKE_PROFIT_PCT = 0.05

POPULAR_PAIRS = [
    "BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT",
    "DOGEUSDT", "ADAUSDT", "AVAXUSDT", "DOTUSDT", "LINKUSDT",
    "MATICUSDT", "LTCUSDT", "UNIUSDT", "ATOMUSDT", "NEARUSDT",
]

TIMEFRAME_MAP = {
    "15分钟": "15m",
    "1小时":  "1h",
    "4小时":  "4h",
    "日线":   "1d",
}

# ─── Simple cache ─────────────────────────────────────────────────────────────
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

def _get(url: str, params: dict = None):
    try:
        r = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
        r.raise_for_status()
        return r.json()
    except Exception:
        return None


def fetch_klines(symbol: str, interval: str) -> pd.DataFrame | None:
    key = f"klines_{symbol}_{interval}"
    def _fetch():
        data = _get(f"{BINANCE_SPOT}/klines", {
            "symbol": symbol, "interval": interval, "limit": KLINE_LIMIT
        })
        if not data:
            return None
        df = pd.DataFrame(data, columns=[
            "open_time","open","high","low","close","volume",
            "close_time","qvolume","trades","taker_buy_base","taker_buy_quote","ignore"
        ])
        for c in ["open","high","low","close","volume","qvolume"]:
            df[c] = pd.to_numeric(df[c], errors="coerce")
        df["datetime"] = pd.to_datetime(df["open_time"], unit="ms")
        return df[["datetime","open","high","low","close","volume","qvolume"]].reset_index(drop=True)
    return _cached(key, _fetch)


def fetch_ticker_24h(symbol: str) -> dict | None:
    key = f"ticker_{symbol}"
    def _fetch():
        return _get(f"{BINANCE_SPOT}/ticker/24hr", {"symbol": symbol})
    return _cached(key, _fetch, ttl=15)


def fetch_all_tickers() -> list | None:
    def _fetch():
        return _get(f"{BINANCE_SPOT}/ticker/24hr")
    return _cached("all_tickers", _fetch, ttl=30)


def fetch_funding_rate(symbol: str) -> float | None:
    key = f"funding_{symbol}"
    def _fetch():
        data = _get(f"{BINANCE_FUTURES}/fundingRate", {"symbol": symbol, "limit": 1})
        if data and len(data) > 0:
            return float(data[0].get("fundingRate", 0))
        return None
    return _cached(key, _fetch, ttl=60)


def fetch_long_short_ratio(symbol: str) -> float | None:
    key = f"lsr_{symbol}"
    def _fetch():
        data = _get(f"{BINANCE_FDATA}/globalLongShortAccountRatio", {
            "symbol": symbol, "period": "1h", "limit": 1
        })
        if data and len(data) > 0:
            return float(data[0].get("longShortRatio", 1.0))
        return None
    return _cached(key, _fetch, ttl=60)


def fetch_open_interest(symbol: str) -> dict | None:
    key = f"oi_{symbol}"
    def _fetch():
        data = _get(f"{BINANCE_FUTURES}/openInterest", {"symbol": symbol})
        if data:
            return {"value": float(data.get("openInterest", 0))}
        return None
    return _cached(key, _fetch, ttl=60)


def fetch_fear_greed() -> dict | None:
    def _fetch():
        data = _get(FNG_URL, {"limit": 1})
        if data and "data" in data and len(data["data"]) > 0:
            d = data["data"][0]
            return {"value": int(d["value"]), "label": d["value_classification"]}
        return None
    return _cached("fng", _fetch, ttl=300)

# ─── Technical Indicators ─────────────────────────────────────────────────────

def calc_rsi(close: pd.Series, period: int = 14) -> pd.Series:
    delta = close.diff()
    gain  = delta.clip(lower=0)
    loss  = (-delta).clip(lower=0)
    ag    = gain.ewm(com=period - 1, min_periods=period, adjust=False).mean()
    al    = loss.ewm(com=period - 1, min_periods=period, adjust=False).mean()
    rs    = ag / al.replace(0, np.nan)
    return 100 - (100 / (1 + rs))


def calc_macd(close: pd.Series, fast=12, slow=26, signal=9):
    ema_f   = close.ewm(span=fast,   adjust=False).mean()
    ema_s   = close.ewm(span=slow,   adjust=False).mean()
    macd    = ema_f - ema_s
    sig_line= macd.ewm(span=signal,  adjust=False).mean()
    hist    = macd - sig_line
    return macd, sig_line, hist


def calc_bb(close: pd.Series, period=20, std_dev=2.0):
    mid   = close.rolling(period).mean()
    std   = close.rolling(period).std(ddof=0)
    return mid + std_dev * std, mid, mid - std_dev * std


def calc_atr(df: pd.DataFrame, period=14) -> pd.Series:
    hi, lo, cl = df["high"], df["low"], df["close"]
    prev_cl = cl.shift(1)
    tr = pd.concat([
        hi - lo,
        (hi - prev_cl).abs(),
        (lo - prev_cl).abs()
    ], axis=1).max(axis=1)
    return tr.rolling(period).mean()


def add_indicators(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    close = df["close"]
    df["rsi"]                          = calc_rsi(close)
    df["macd"], df["macd_sig"], df["macd_hist"] = calc_macd(close)
    df["bb_upper"], df["bb_mid"], df["bb_lower"] = calc_bb(close)
    df["ema20"]    = close.ewm(span=20, adjust=False).mean()
    df["ema50"]    = close.ewm(span=50, adjust=False).mean()
    df["atr"]      = calc_atr(df)
    df["vol_ma10"] = df["volume"].rolling(10).mean()
    return df

# ─── Signal Generation ────────────────────────────────────────────────────────

def generate_signal(df: pd.DataFrame) -> dict:
    clean = df.dropna(subset=["rsi","macd","bb_upper","ema20","ema50","atr"])
    if len(clean) < 2:
        return {"signal": "数据不足", "color": "#888888", "direction": "观望",
                "win_rate": "N/A", "confidence": 0}

    r = clean.iloc[-1]
    prev = clean.iloc[-2]

    rsi         = r["rsi"]
    price       = r["close"]
    macd_hist   = r["macd_hist"]
    prev_hist   = prev["macd_hist"]
    bb_upper    = r["bb_upper"]
    bb_lower    = r["bb_lower"]
    bb_mid      = r["bb_mid"]
    ema20       = r["ema20"]
    ema50       = r["ema50"]
    atr         = r["atr"]
    atr_pct     = atr / price * 100

    macd_cross_up   = macd_hist > 0 and prev_hist <= 0
    macd_cross_down = macd_hist < 0 and prev_hist >= 0
    macd_bull       = macd_hist > 0
    macd_bear       = macd_hist < 0
    ema_bull        = ema20 > ema50
    ema_bear        = ema20 < ema50
    near_lower_bb   = price <= bb_lower * 1.01
    near_upper_bb   = price >= bb_upper * 0.99

    bull_score = 0
    bear_score = 0

    if rsi < 30:            bull_score += 3
    elif rsi < 40:          bull_score += 2
    elif rsi < 50:          bull_score += 1
    if rsi > 70:            bear_score += 3
    elif rsi > 60:          bear_score += 2
    elif rsi > 50:          bear_score += 1

    if macd_cross_up:       bull_score += 3
    elif macd_bull:         bull_score += 1
    if macd_cross_down:     bear_score += 3
    elif macd_bear:         bear_score += 1

    if ema_bull:            bull_score += 2
    if ema_bear:            bear_score += 2

    if near_lower_bb:       bull_score += 2
    if near_upper_bb:       bear_score += 2

    net = bull_score - bear_score

    if net >= 6:
        signal, color = "强烈买入 🚀", "#00c851"
        direction = "开多 📈"
        win_rate  = "约 70%"
        confidence = min(95, 60 + net * 3)
    elif net >= 3:
        signal, color = "买入 📈", "#33b679"
        direction = "开多 📈"
        win_rate  = "约 60%"
        confidence = min(80, 50 + net * 3)
    elif net <= -6:
        signal, color = "强烈卖出 ⚠️", "#cc0000"
        direction = "开空 📉"
        win_rate  = "约 70%"
        confidence = min(95, 60 + abs(net) * 3)
    elif net <= -3:
        signal, color = "卖出 📉", "#ff4444"
        direction = "开空 📉"
        win_rate  = "约 60%"
        confidence = min(80, 50 + abs(net) * 3)
    else:
        signal, color = "观望 ⏸", "#ffab00"
        direction = "观望"
        win_rate  = "< 50%"
        confidence = 30

    is_long    = "多" in direction
    entry      = price
    stop_loss  = entry * (1 - STOP_LOSS_PCT) if is_long else entry * (1 + STOP_LOSS_PCT)
    take_profit= entry * (1 + TAKE_PROFIT_PCT) if is_long else entry * (1 - TAKE_PROFIT_PCT)

    order_type, limit_price = _order_type(price, bb_lower, bb_mid, ema20, is_long, net)

    return {
        "signal": signal, "color": color,
        "direction": direction, "win_rate": win_rate,
        "confidence": confidence,
        "price": price, "rsi": rsi,
        "macd_hist": macd_hist, "atr_pct": atr_pct,
        "ema20": ema20, "ema50": ema50,
        "bb_upper": bb_upper, "bb_lower": bb_lower, "bb_mid": bb_mid,
        "entry": entry, "stop_loss": stop_loss, "take_profit": take_profit,
        "order_type": order_type, "limit_price": limit_price,
        "bull_score": bull_score, "bear_score": bear_score,
        "is_long": is_long,
    }


def _order_type(price, bb_lower, bb_mid, ema20, is_long: bool, net: int):
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


def calc_position(capital_u: float, sig: dict, leverage: int) -> dict:
    risk_u       = capital_u * STOP_LOSS_PCT
    sl_pct       = STOP_LOSS_PCT
    open_u       = min(capital_u * 0.3, risk_u / sl_pct)
    open_u       = round(open_u, 1)
    nominal_u    = open_u * leverage
    profit_u     = round(open_u * TAKE_PROFIT_PCT * leverage, 2)
    loss_u       = round(open_u * STOP_LOSS_PCT   * leverage, 2)
    return {
        "open_u": open_u, "leverage": leverage,
        "nominal_u": nominal_u,
        "profit_u": profit_u, "loss_u": loss_u,
    }


def recommend_leverage(sig: dict) -> int:
    atr_pct = sig.get("atr_pct", 2.0)
    net     = sig.get("bull_score", 0) - sig.get("bear_score", 0)
    if "观望" in sig["signal"]:
        return 1
    if atr_pct > 3:
        return 2
    if abs(net) >= 6:
        return min(5, int(4 + (abs(net) - 6) * 0.5))
    if abs(net) >= 3:
        return 3
    return 2

# ─── Market Sentiment ─────────────────────────────────────────────────────────

def fetch_sentiment(symbol: str) -> dict:
    fng  = fetch_fear_greed() or {"value": 50, "label": "Neutral"}
    fr   = fetch_funding_rate(symbol)
    lsr  = fetch_long_short_ratio(symbol)

    fg_val = fng["value"]
    fg_label_map = {
        range(0,  25): "极度恐惧 😱",
        range(25, 47): "恐惧 😰",
        range(47, 54): "中性 😐",
        range(54, 75): "贪婪 😏",
        range(75, 101):"极度贪婪 🤑",
    }
    fg_label = "未知"
    for r, lbl in fg_label_map.items():
        if fg_val in r:
            fg_label = lbl
            break

    sent_score = fg_val
    sent_bull  = 0
    sent_bear  = 0

    if fg_val < 25:   sent_bull += 2
    elif fg_val < 40: sent_bull += 1
    if fg_val > 75:   sent_bear += 2
    elif fg_val > 60: sent_bear += 1

    fr_label = "N/A"
    if fr is not None:
        fr_pct = fr * 100
        if fr_pct > 0.1:
            fr_label = f"+{fr_pct:.4f}%（多头过热，注意轧空风险）"
            sent_bear += 1
        elif fr_pct < -0.05:
            fr_label = f"{fr_pct:.4f}%（空头过热，做多有优势）"
            sent_bull += 1
        else:
            fr_label = f"{fr_pct:.4f}%（中性）"

    lsr_label = "N/A"
    if lsr is not None:
        if lsr > 1.2:
            lsr_label = f"{lsr:.2f}（多头占优）"
            sent_bull += 1
        elif lsr < 0.8:
            lsr_label = f"{lsr:.2f}（空头占优）"
            sent_bear += 1
        else:
            lsr_label = f"{lsr:.2f}（多空均衡）"

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

def ai_analyze(symbol: str, sig: dict, sentiment: dict, capital_u: float, strategy: str) -> str:
    if _ai_client is None:
        return "（AI 分析未启用：未配置 DEEPSEEK_API_KEY）"

    rsi_status = "超卖" if sig["rsi"] < 30 else ("超买" if sig["rsi"] > 70 else "中性")
    macd_status= "多头金叉" if sig["macd_hist"] > 0 else "空头死叉"
    ema_status = "多头排列" if sig["ema20"] > sig["ema50"] else "空头排列"

    prompt = f"""你是专业加密货币量化交易分析师，请根据以下实时数据用中文给出综合交易建议：

【币种】{symbol}  【当前价格】${sig['price']:,.4f}
【策略类型】{strategy}  【本金】{capital_u} USDT

【技术指标】
- RSI(14): {sig['rsi']:.1f}（{rsi_status}）
- MACD柱状图: {sig['macd_hist']:+.6f}（{macd_status}）
- EMA20/EMA50: {ema_status}
- 布林带位置: 上轨${sig['bb_upper']:,.2f} / 下轨${sig['bb_lower']:,.2f}
- ATR波动率: {sig['atr_pct']:.2f}%

【市场情绪】
- 恐惧贪婪指数: {sentiment['fg_val']}（{sentiment['fg_label']}）
- 资金费率: {sentiment['fr_label']}
- 多空比: {sentiment['lsr_label']}
- 综合情绪: {sentiment['overall']}

【规则信号】{sig['signal']}，建议{sig['direction']}，胜率{sig['win_rate']}

请给出（不超过200字）：
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

def scan_market(strategy: str = "快进快出") -> dict:
    tickers = fetch_all_tickers()
    if not tickers:
        return {"热门榜": [], "涨幅榜": [], "跌幅榜": [], "快进快出榜": []}

    usdt = [t for t in tickers if t.get("symbol","").endswith("USDT")
            and float(t.get("quoteVolume","0")) > 1_000_000]

    def to_row(t):
        sym    = t["symbol"]
        price  = float(t["lastPrice"])
        chg    = float(t["priceChangePercent"])
        vol    = float(t["quoteVolume"])
        hi     = float(t["highPrice"])
        lo     = float(t["lowPrice"])
        spread = (hi - lo) / ((hi + lo) / 2) * 100 if (hi + lo) > 0 else 0
        return {"symbol": sym, "price": price, "change": chg, "volume": vol, "spread": spread}

    rows = [to_row(t) for t in usdt]

    hot   = sorted(rows, key=lambda x: x["volume"],  reverse=True)[:5]
    up    = sorted([r for r in rows if r["change"] > 3],
                   key=lambda x: x["change"], reverse=True)[:5]
    down  = sorted([r for r in rows if r["change"] < -3],
                   key=lambda x: x["change"])[:5]
    scalp = sorted(rows, key=lambda x: x["spread"] * x["volume"], reverse=True)[:5]

    return {"热门榜": hot, "涨幅榜": up, "跌幅榜": down, "快进快出榜": scalp}


def select_best_coin(capital_u: float, strategy: str) -> str:
    market = scan_market(strategy)
    if strategy == "快进快出":
        coins = market["快进快出榜"]
        reason= "高波动×高成交量，适合快进快出"
    elif strategy == "趋势交易":
        coins = market["涨幅榜"]
        reason= "强势上涨趋势，适合顺势持仓"
    else:
        coins = market["热门榜"]
        reason= "成交量最大，流动性好"

    if not coins:
        return "暂无推荐（数据获取失败）"

    top = coins[0]
    note = ""
    if capital_u < 200 and "BTC" in top["symbol"]:
        alts = [c for c in coins if "BTC" not in c["symbol"]]
        if alts:
            top  = alts[0]
            note = "（小资金优先山寨币，波动幅度更适合）"

    return f"**推荐：{top['symbol']}**{note}\n涨跌: {top['change']:+.2f}% | 成交量: ${top['volume']/1e6:.1f}M | 理由: {reason}"

# ─── Chart ────────────────────────────────────────────────────────────────────

def build_chart(df: pd.DataFrame, symbol: str) -> plt.Figure | None:
    try:
        df_plot = df.dropna(subset=["rsi","macd"]).tail(80).copy()
        df_plot = df_plot.reset_index(drop=True)
        n = len(df_plot)
        if n < 5:
            return None

        plt.style.use("dark_background")
        fig = plt.figure(figsize=(12, 9), facecolor="#0d1117")
        gs  = gridspec.GridSpec(3, 1, height_ratios=[3, 1, 1], hspace=0.08)
        ax1 = fig.add_subplot(gs[0])
        ax2 = fig.add_subplot(gs[1], sharex=ax1)
        ax3 = fig.add_subplot(gs[2], sharex=ax1)

        for ax in [ax1, ax2, ax3]:
            ax.set_facecolor("#0d1117")
            ax.tick_params(colors="#aaaaaa", labelsize=7)
            ax.spines["top"].set_visible(False)
            ax.spines["right"].set_visible(False)
            for spine in ax.spines.values():
                spine.set_color("#333333")

        # ── Panel 1: Candlesticks ──
        for i, row in df_plot.iterrows():
            is_bull = row["close"] >= row["open"]
            color   = "#00c851" if is_bull else "#ff4444"
            bot     = min(row["open"], row["close"])
            height  = abs(row["close"] - row["open"]) or row["close"] * 0.001
            ax1.add_patch(Rectangle((i - 0.35, bot), 0.7, height,
                                     color=color, zorder=3))
            ax1.vlines(i, row["low"], row["high"], color=color,
                       linewidth=0.8, zorder=2)

        xs = df_plot.index.tolist()
        ax1.plot(xs, df_plot["bb_upper"], "--", color="#4a90d9", lw=0.8, label="BB Upper")
        ax1.plot(xs, df_plot["bb_mid"],   ":",  color="#888888", lw=0.8, label="BB Mid")
        ax1.plot(xs, df_plot["bb_lower"], "--", color="#4a90d9", lw=0.8, label="BB Lower")
        ax1.fill_between(xs, df_plot["bb_upper"], df_plot["bb_lower"],
                         alpha=0.05, color="#4a90d9")
        ax1.plot(xs, df_plot["ema20"], color="#f5a623", lw=1.2, label="EMA20")
        ax1.plot(xs, df_plot["ema50"], color="#bd10e0", lw=1.2, label="EMA50")

        ax1.set_ylabel("Price (USDT)", color="#aaaaaa", fontsize=8)
        ax1.set_title(f"{symbol}  |  Last: ${df_plot['close'].iloc[-1]:,.4f}",
                      color="white", fontsize=10, pad=8)
        ax1.legend(loc="upper left", fontsize=6, framealpha=0.3,
                   labelcolor="white", facecolor="#1a1a2e")
        ax1.grid(axis="y", color="#1f1f2e", lw=0.5)

        # ── Panel 2: Volume ──
        for i, row in df_plot.iterrows():
            color = "#00c851" if row["close"] >= row["open"] else "#ff4444"
            ax2.bar(i, row["volume"], color=color, alpha=0.7, width=0.7)
        ax2.plot(xs, df_plot["vol_ma10"], color="#f5a623", lw=1.0)
        ax2.set_ylabel("Volume", color="#aaaaaa", fontsize=7)
        ax2.grid(axis="y", color="#1f1f2e", lw=0.5)

        # ── Panel 3: RSI ──
        ax3.plot(xs, df_plot["rsi"], color="#9b59b6", lw=1.2)
        ax3.axhline(70, color="#ff4444", lw=0.8, ls="--")
        ax3.axhline(30, color="#00c851", lw=0.8, ls="--")
        ax3.axhline(50, color="#555555", lw=0.5, ls=":")
        ax3.fill_between(xs, df_plot["rsi"], 70,
                         where=df_plot["rsi"] >= 70, alpha=0.2, color="#ff4444")
        ax3.fill_between(xs, df_plot["rsi"], 30,
                         where=df_plot["rsi"] <= 30, alpha=0.2, color="#00c851")
        ax3.set_ylim(0, 100)
        ax3.set_ylabel("RSI", color="#aaaaaa", fontsize=7)
        ax3.grid(axis="y", color="#1f1f2e", lw=0.5)

        # X-axis labels (show every ~10 candles)
        step = max(1, n // 8)
        ticks = list(range(0, n, step))
        labels = [df_plot["datetime"].iloc[i].strftime("%m/%d %H:%M") for i in ticks]
        ax3.set_xticks(ticks)
        ax3.set_xticklabels(labels, rotation=30, ha="right", fontsize=6, color="#aaaaaa")
        plt.setp(ax1.get_xticklabels(), visible=False)
        plt.setp(ax2.get_xticklabels(), visible=False)

        plt.tight_layout(rect=[0, 0, 1, 1])
        return fig
    except Exception as e:
        print(f"Chart error: {e}")
        return None

# ─── HTML Builders ────────────────────────────────────────────────────────────

def _fmt(price: float) -> str:
    if price >= 1000:   return f"${price:,.2f}"
    if price >= 1:      return f"${price:.4f}"
    return f"${price:.6f}"


def card(title: str, body: str, border_color: str = "#333") -> str:
    return (f'<div style="background:#161b22;border:1px solid {border_color};'
            f'border-radius:10px;padding:14px;margin:4px;">'
            f'<div style="font-size:12px;color:#888;margin-bottom:6px">{title}</div>'
            f'{body}</div>')


def build_price_html(ticker: dict | None, sig: dict) -> str:
    price = sig["price"]
    chg   = float(ticker["priceChangePercent"]) if ticker else 0
    hi    = float(ticker["highPrice"])          if ticker else 0
    lo    = float(ticker["lowPrice"])           if ticker else 0
    chg_color = "#00c851" if chg >= 0 else "#ff4444"
    body = (f'<div style="font-size:26px;font-weight:bold;color:white">{_fmt(price)}</div>'
            f'<div style="font-size:16px;color:{chg_color};margin-top:4px">'
            f'{"▲" if chg >= 0 else "▼"} {chg:+.2f}%</div>'
            f'<div style="font-size:12px;color:#888;margin-top:4px">'
            f'高: {_fmt(hi)} &nbsp; 低: {_fmt(lo)}</div>')
    return card("当前价格", body, "#333")


def build_signal_html(sig: dict) -> str:
    body = (f'<div style="font-size:24px;font-weight:bold;color:{sig["color"]}">'
            f'{sig["signal"]}</div>'
            f'<div style="font-size:13px;color:#ccc;margin-top:6px">'
            f'{sig["direction"]} &nbsp;|&nbsp; 胜率 {sig["win_rate"]}</div>'
            f'<div style="font-size:12px;color:#888;margin-top:4px">'
            f'置信度 {sig["confidence"]}%</div>')
    return card("交易信号", body, sig["color"])


def build_rec_html(sig: dict, pos: dict, leverage: int) -> str:
    is_long = sig["is_long"]
    sl_color = "#ff4444"
    tp_color = "#00c851"
    order_hint = sig["order_type"]
    if sig["limit_price"]:
        order_hint += f" @ {_fmt(sig['limit_price'])}"

    body = (
        f'<table style="width:100%;border-collapse:collapse;font-size:13px;color:#ddd">'
        f'<tr><td style="padding:4px 0;color:#888">📌 入场方式</td>'
        f'<td style="padding:4px 0;font-weight:bold">{order_hint}</td></tr>'
        f'<tr><td style="padding:4px 0;color:#888">💰 建议仓位</td>'
        f'<td style="padding:4px 0"><b>{pos["open_u"]}U</b>'
        f'（{leverage}倍杠杆 = {pos["nominal_u"]:.0f}U 名义价值）</td></tr>'
        f'<tr><td style="padding:4px 0;color:{sl_color}">🛡 止损价</td>'
        f'<td style="padding:4px 0"><b>{_fmt(sig["stop_loss"])}</b>'
        f'（预计亏损 -{pos["loss_u"]}U）</td></tr>'
        f'<tr><td style="padding:4px 0;color:{tp_color}">🎯 止盈价</td>'
        f'<td style="padding:4px 0"><b>{_fmt(sig["take_profit"])}</b>'
        f'（预计盈利 +{pos["profit_u"]}U）</td></tr>'
        f'<tr><td style="padding:4px 0;color:#888">⚡ 杠杆建议</td>'
        f'<td style="padding:4px 0"><b>{leverage}倍</b>'
        f'（新手建议 ≤ 3倍）</td></tr>'
        f'</table>'
    )
    return card("操作建议", body, "#4a90d9")


def build_indicators_html(sig: dict, sentiment: dict) -> str:
    rsi = sig["rsi"]
    rsi_color = "#ff4444" if rsi > 70 else ("#00c851" if rsi < 30 else "#ffab00")
    rsi_label = "超买" if rsi > 70 else ("超卖" if rsi < 30 else "中性")
    macd_color = "#00c851" if sig["macd_hist"] > 0 else "#ff4444"
    macd_label = "多头" if sig["macd_hist"] > 0 else "空头"
    ema_color  = "#00c851" if sig["ema20"] > sig["ema50"] else "#ff4444"
    ema_label  = "多头排列" if sig["ema20"] > sig["ema50"] else "空头排列"

    body = (
        f'<div style="display:flex;flex-wrap:wrap;gap:8px">'
        f'<div style="flex:1;min-width:120px;background:#1a1a2e;border-radius:8px;padding:10px">'
        f'<div style="font-size:11px;color:#888">RSI(14)</div>'
        f'<div style="font-size:18px;font-weight:bold;color:{rsi_color}">{rsi:.1f}</div>'
        f'<div style="font-size:11px;color:{rsi_color}">{rsi_label}</div></div>'
        f'<div style="flex:1;min-width:120px;background:#1a1a2e;border-radius:8px;padding:10px">'
        f'<div style="font-size:11px;color:#888">MACD柱</div>'
        f'<div style="font-size:18px;font-weight:bold;color:{macd_color}">'
        f'{sig["macd_hist"]:+.5f}</div>'
        f'<div style="font-size:11px;color:{macd_color}">{macd_label}</div></div>'
        f'<div style="flex:1;min-width:120px;background:#1a1a2e;border-radius:8px;padding:10px">'
        f'<div style="font-size:11px;color:#888">均线趋势</div>'
        f'<div style="font-size:14px;font-weight:bold;color:{ema_color}">{ema_label}</div>'
        f'<div style="font-size:11px;color:#888">波动率 {sig["atr_pct"]:.2f}%</div></div>'
        f'<div style="flex:1;min-width:120px;background:#1a1a2e;border-radius:8px;padding:10px">'
        f'<div style="font-size:11px;color:#888">市场情绪</div>'
        f'<div style="font-size:14px;font-weight:bold;color:#ffab00">{sentiment["overall"]}</div>'
        f'<div style="font-size:11px;color:#888">恐惧贪婪 {sentiment["fg_val"]}</div></div>'
        f'</div>'
    )
    return card("技术指标 & 市场情绪", body, "#333")


def build_sentiment_html(sentiment: dict) -> str:
    fg = sentiment["fg_val"]
    bar_color = "#00c851" if fg < 40 else ("#ff4444" if fg > 60 else "#ffab00")
    body = (
        f'<div style="margin-bottom:8px;font-size:13px;color:#ccc">'
        f'<b>恐惧贪婪指数：</b> '
        f'<span style="color:{bar_color};font-size:18px;font-weight:bold">{fg}</span>'
        f' / 100 — {sentiment["fg_label"]}</div>'
        f'<div style="background:#333;border-radius:4px;height:8px;margin-bottom:10px">'
        f'<div style="background:{bar_color};width:{fg}%;height:100%;border-radius:4px"></div>'
        f'</div>'
        f'<div style="font-size:12px;color:#aaa;line-height:1.8">'
        f'资金费率：{sentiment["fr_label"]}<br>'
        f'多空持仓比：{sentiment["lsr_label"]}<br>'
        f'综合情绪判断：<b style="color:#ffab00">{sentiment["overall"]}</b></div>'
    )
    return card("市场情绪分析", body, "#333")


def build_scan_html(market: dict) -> str:
    def rows(coins, key="symbol"):
        if not coins:
            return "<tr><td colspan='3' style='color:#888;padding:4px'>暂无数据</td></tr>"
        out = ""
        for c in coins:
            color = "#00c851" if c["change"] >= 0 else "#ff4444"
            out += (f'<tr><td style="padding:3px 6px;color:white">{c["symbol"]}</td>'
                    f'<td style="padding:3px 6px;color:{color}">{c["change"]:+.2f}%</td>'
                    f'<td style="padding:3px 6px;color:#aaa">${c["volume"]/1e6:.0f}M</td></tr>')
        return out

    table_style = 'style="width:100%;border-collapse:collapse;font-size:12px"'
    head = ('<tr style="color:#888;border-bottom:1px solid #333">'
            '<th style="padding:4px 6px;text-align:left">币种</th>'
            '<th style="padding:4px 6px;text-align:left">涨跌</th>'
            '<th style="padding:4px 6px;text-align:left">成交量</th></tr>')

    def section(title, coins):
        return (f'<div style="flex:1;min-width:200px">'
                f'<div style="font-size:12px;color:#888;margin-bottom:6px">{title}</div>'
                f'<table {table_style}>{head}{rows(coins)}</table></div>')

    body = (f'<div style="display:flex;flex-wrap:wrap;gap:12px">'
            f'{section("🔥 热门榜", market["热门榜"])}'
            f'{section("📈 涨幅榜", market["涨幅榜"])}'
            f'{section("📉 跌幅榜", market["跌幅榜"])}'
            f'{section("⚡ 快进快出", market["快进快出榜"])}'
            f'</div>')
    return card("市场扫描", body, "#333")


def build_ai_html(ai_text: str) -> str:
    body = f'<div style="font-size:13px;color:#ddd;line-height:1.8;white-space:pre-wrap">{ai_text}</div>'
    return card("🤖 AI 综合分析（DeepSeek）", body, "#7c3aed")

# ─── Main Orchestrator ────────────────────────────────────────────────────────

def run_analysis(symbol: str, timeframe_label: str,
                 capital_u: float, strategy: str) -> tuple:
    interval = TIMEFRAME_MAP.get(timeframe_label, "1h")
    timestamp = f"⏱ 分析时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"

    df = fetch_klines(symbol, interval)
    if df is None or len(df) < 60:
        err = '<div style="color:#ff4444;padding:20px">数据获取失败，请检查网络连接或稍后重试</div>'
        empty_fig = None
        return err, err, err, err, err, empty_fig, err, timestamp

    df = add_indicators(df)
    sig = generate_signal(df)
    leverage = recommend_leverage(sig)
    pos = calc_position(capital_u, sig, leverage)
    ticker = fetch_ticker_24h(symbol)
    sentiment = fetch_sentiment(symbol)
    market = scan_market(strategy)
    ai_text = ai_analyze(symbol, sig, sentiment, capital_u, strategy)
    chart = build_chart(df, symbol)

    price_html   = build_price_html(ticker, sig)
    signal_html  = build_signal_html(sig)
    rec_html     = build_rec_html(sig, pos, leverage)
    indic_html   = build_indicators_html(sig, sentiment)
    sent_html    = build_sentiment_html(sentiment)
    scan_html    = build_scan_html(market)
    ai_html      = build_ai_html(ai_text)

    return (price_html, signal_html, rec_html, indic_html,
            sent_html, chart, scan_html, ai_html, timestamp)

# ─── Gradio UI ────────────────────────────────────────────────────────────────

RISK_WARNING = """<div style="background:#1a0a0a;border:1px solid #cc0000;border-radius:8px;
padding:12px;margin-bottom:12px;font-size:12px;color:#ffaaaa">
⚠️ <b>风险警告</b>：本工具仅供参考，不构成投资建议。加密货币交易有极高风险，
价格波动剧烈，杠杆交易可能导致超额亏损，您可能损失全部本金。
请在充分了解风险的前提下，只投入您能承受损失的资金。</div>"""

CSS = """
.gradio-container { max-width: 100% !important; }
.main { padding: 8px !important; }
footer { display: none !important; }
"""

with gr.Blocks(title="加密货币智能交易分析器", css=CSS,
               theme=gr.themes.Base(primary_hue="violet")) as demo:

    gr.Markdown("# 🚀 加密货币智能交易分析器")
    gr.HTML(RISK_WARNING)

    with gr.Row():
        dd_symbol = gr.Dropdown(
            choices=POPULAR_PAIRS, value="BTCUSDT",
            label="选择交易对", scale=3
        )
        dd_tf = gr.Dropdown(
            choices=list(TIMEFRAME_MAP.keys()), value="1小时",
            label="时间周期", scale=2
        )
        num_capital = gr.Number(value=100, label="本金（USDT）", minimum=10, scale=2)
        dd_strategy = gr.Dropdown(
            choices=["快进快出", "趋势交易"], value="快进快出",
            label="策略类型", scale=2
        )

    btn = gr.Button("🔍 开始分析", variant="primary", size="lg")
    ts_md = gr.Markdown("等待分析...")

    with gr.Row():
        html_price  = gr.HTML()
        html_signal = gr.HTML()
        html_rec    = gr.HTML()

    html_indic = gr.HTML()
    html_sent  = gr.HTML()
    plot_chart = gr.Plot(label="K线图表")
    html_scan  = gr.HTML()
    html_ai    = gr.HTML()

    inputs  = [dd_symbol, dd_tf, num_capital, dd_strategy]
    outputs = [html_price, html_signal, html_rec, html_indic,
               html_sent, plot_chart, html_scan, html_ai, ts_md]

    btn.click(fn=run_analysis, inputs=inputs, outputs=outputs)
    demo.load(fn=run_analysis, inputs=inputs, outputs=outputs)

    try:
        timer = gr.Timer(value=60)
        timer.tick(fn=run_analysis, inputs=inputs, outputs=outputs)
    except Exception:
        gr.HTML("""<script>
        setInterval(function(){
            var b=document.querySelector('button.lg');
            if(b) b.click();
        }, 60000);
        </script>""")

if __name__ == "__main__":
    # share=True 在本机/服务器上创建公网链接
    # 在 Replit / HF Spaces 上设为 False（平台自动提供 URL）
    _share = os.environ.get("GRADIO_SHARE", "true").lower() == "true"
    _port  = int(os.environ.get("GRADIO_SERVER_PORT", "7861"))
    demo.queue().launch(
        server_name="0.0.0.0",
        server_port=_port,
        share=_share,
        show_error=True,
    )
