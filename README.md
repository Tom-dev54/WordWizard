# Crypto Analyzer

一个基于 Gradio 的加密货币智能分析工具。它会从 Binance 拉取实时行情，计算常用技术指标，并结合 DeepSeek API 输出交易方向、止损止盈和仓位参考。

> 仅供学习和研究使用，不构成投资建议。加密货币波动极高，请自行控制风险。

## 核心功能

- 行情扫描：热门榜、涨幅榜、跌幅榜、快进快出榜
- 技术指标：RSI、MACD、布林带、EMA20/50、ATR
- 市场情绪：恐惧贪婪指数、资金费率、多空比
- AI 分析：使用 DeepSeek 生成开多/开空、杠杆、止损止盈建议
- 仓位计算：根据本金自动估算参考仓位
- Web 界面：Gradio 一键启动，适合 Replit / Hugging Face Spaces / 本地运行

## 项目结构

```text
.
├── crypto_analyzer.py   # 主程序：行情、指标、AI 分析和 Gradio UI
├── app.py               # 兼容部署平台的入口
├── requirements.txt     # Python 依赖
├── .replit              # Replit 启动配置
├── .env.example         # 环境变量示例
└── README.md
```

## 本地运行

```bash
pip install -r requirements.txt
copy .env.example .env
python crypto_analyzer.py
```

在 `.env` 中填写：

```text
DEEPSEEK_API_KEY=your_deepseek_api_key
```

## Replit 运行

`.replit` 已配置为启动 `crypto_analyzer.py`。在 Replit 的 Secrets 中添加：

```text
DEEPSEEK_API_KEY=your_deepseek_api_key
```

然后点击 Run。

## 项目拆分

原仓库曾混入背单词工具 `word.py`。该功能已经拆分到独立仓库：

- `WordWizard-Vocabulary`

当前仓库只保留加密货币分析器，避免两个项目的依赖、环境变量和 README 混在一起。
