# WordWizard

## 项目简介
WordWizard 是一个创新的背单词应用程序，旨在通过生成荒谬而反直觉的故事和相关图片来帮助用户记忆单词。该项目使用了讯飞星火大模型 API，结合 Gradio 提供的用户交互界面，实现了一个功能强大的学习工具。

## 功能
- 根据用户输入的单词生成荒谬而有趣的故事。
- 根据故事内容生成相关的漫画风格图片。
- 提供图片理解功能，确保生成的图片与故事内容高度匹配。
- 允许用户上传文件，从文件中随机选择单词进行记忆。
- 提供多种参数调节选项，以优化输出内容。

## 安装说明

### 前提条件
- Python 3.7 及以上版本
- Git

### 克隆仓库
```bash
git clone https://github.com/你的用户名/WordWizard.git
cd WordWizard

###创建虚拟环境并安装依赖
python -m venv my_project_env
source my_project_env/bin/activate  # 在 Windows 上使用 `my_project_env\Scripts\activate`
pip install -r requirements.txt

###配置环境变量
在项目根目录创建一个 .env 文件，并添加以下内容：
SPARKAI_APP_ID=你的APP_ID
SPARKAI_API_KEY=你的API_KEY
SPARKAI_API_SECRET=你的API_SECRET

#使用指南
##运行应用
python app.py

##交互界面
在浏览器中打开 http://127.0.0.1:7860 访问 Gradio 提供的用户界面。

##生成故事和图片
1.输入你想要记忆的单词（建议输入30个单词）。
2.（可选）输入用于生成故事和图片的提示词。
3.调节生成内容的参数（如最大生成长度）。
4.点击“生成”按钮，等待生成结果。
