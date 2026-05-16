# 加密货币智能交易分析器

实时行情 + 技术指标 + 市场情绪 + DeepSeek AI 综合分析。

## 在 Replit 上运行

1. 点击右上角 **Run** 按钮，等待依赖安装
2. 左侧 **Secrets** 添加：
   - Key: `DEEPSEEK_API_KEY`，Value: 你的 DeepSeek API Key
3. 顶部 webview 出现后点击链接，手机浏览器可直接访问

## 功能
- 自动扫描市场：热门榜 / 涨幅榜 / 跌幅榜 / 快进快出榜
- 技术指标：RSI、MACD、布林带、EMA20/50、ATR
- 市场情绪：恐惧贪婪指数、资金费率、多空比
- AI 综合分析：DeepSeek 给出开多/开空/杠杆/止损止盈建议
- 根据本金自动计算仓位

## AI 接入说明
使用 **DeepSeek API**（兼容 OpenAI SDK，非 SparkAI）。
代码中的 `from openai import OpenAI` + `base_url="https://api.deepseek.com"` 是 DeepSeek 的标准接入方式。

⚠️ 仅供参考，不构成投资建议。加密货币有极高风险。
