# 加密货币智能交易分析器

实时行情 + 技术指标 + 市场情绪 + DeepSeek AI 综合分析。

## 在 Replit 上运行

1. 点击右上角 **Run** 按钮，等待依赖安装（约1分钟）
2. 左侧 🔒 **Secrets** 添加：
   - Key: `DEEPSEEK_API_KEY`，Value: 你的 DeepSeek API Key
3. 顶部 webview 出现后点击链接，手机浏览器可直接访问

## 功能
- 自动扫描市场：热门榜 / 涨幅榜 / 跌幅榜 / 快进快出榜
- 技术指标：RSI、MACD、布林带、EMA20/50、ATR
- 市场情绪：恐惧贪婪指数、资金费率、多空比
- AI 综合分析：DeepSeek 给出开多/开空/杠杆/止损止盈建议
- 根据本金自动计算仓位

## 关于 AI 接入
使用 **DeepSeek API**（兼容 OpenAI SDK，与 SparkAI 无关）。
`from openai import OpenAI` + `base_url="https://api.deepseek.com"` 是 DeepSeek 标准接入方式。

## 注意
word.py 是另一个独立项目，不会被运行（Replit 只执行 `.replit` 里指定的 crypto_analyzer.py）。

⚠️ 仅供参考，不构成投资建议。加密货币有极高风险。
