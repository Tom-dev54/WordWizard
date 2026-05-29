# Crypto Analyzer

加密货币智能交易分析器，使用 Gradio 提供 Web 界面，结合实时行情、技术指标、市场情绪和 DeepSeek AI 生成分析结果。

## 功能

- 自动扫描热门榜、涨幅榜、跌幅榜、快进快出榜
- 计算 RSI、MACD、布林带、EMA20/50、ATR 等技术指标
- 获取恐惧贪婪指数、资金费率、多空比
- 使用 DeepSeek API 输出开多/开空、杠杆、止损止盈等建议
- 根据本金自动计算仓位

## 运行

1. 安装依赖：

```bash
pip install -r requirements.txt
```

2. 配置 DeepSeek API Key：

```bash
copy .env.example .env
```

然后在 `.env` 中填写：

```text
DEEPSEEK_API_KEY=your_deepseek_api_key
```

3. 启动：

```bash
python crypto_analyzer.py
```

Replit 环境会按 `.replit` 配置自动启动 `crypto_analyzer.py`。

## 项目拆分说明

原仓库里的背单词工具 `word.py` 已拆分到独立仓库 `WordWizard-Vocabulary`，本仓库只保留加密货币分析器，避免两个项目混在一起。

## 风险提示

本工具仅供学习和研究使用，不构成投资建议。加密货币波动极高，请自行控制风险。
