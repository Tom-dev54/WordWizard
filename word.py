import gradio as gr
from dwspark.config import Config
from dwspark.models import ChatModel, Text2Img, ImageUnderstanding
from sparkai.core.messages import ChatMessage
from loguru import logger
import random
import os
import asyncio
import time
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 配置
config = Config(
    appid=os.getenv('SPARKAI_APP_ID'),
    apikey=os.getenv('SPARKAI_API_KEY'),
    apisecret=os.getenv('SPARKAI_API_SECRET')
)

# 初始化模型
chat_model = ChatModel(config, stream=False)
img_model = Text2Img(config)
iu_model = ImageUnderstanding(config)


# 分段生成故事并验证
async def generate_segmented_story(words, story_prompt, max_length, progress):
    try:
        system_prompt = "Write a bizarre, counterintuitive, and logically coherent story to help me remember these words."
        story = ""
        chunk_size = max(1, len(words) // 3)  # 将单词分成三组
        for i in range(0, len(words), chunk_size):
            word_chunk = words[i:i + chunk_size]
            combined_words = ', '.join(word_chunk)
            prompt = f"{system_prompt} Include the following words: {combined_words}. {story_prompt}"
            retries = 5  # 设置重试次数
            for attempt in range(retries):
                segment = await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: chat_model.generate([ChatMessage(role="user", content=prompt)])
                )
                if all(word in segment for word in word_chunk):
                    story += " " + segment[:max_length // 3]  # 限制每段的长度
                    break
                if attempt == retries - 1:
                    return f"Error: The words '{', '.join(word_chunk)}' could not be included in the story after {retries} attempts."
            progress(0.3 + 0.2 * (i + chunk_size) / len(words))  # 更新进度

        return story.strip()  # 去除前后的空格
    except asyncio.TimeoutError:
        return "Error: The request timed out while generating the story."
    except Exception as e:
        return f"Error generating story: {e}"


# 翻译句子
async def translate_sentence(sentence):
    try:
        prompt = f"Translate the following sentence to Chinese: {sentence}"
        response = await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: chat_model.generate([ChatMessage(role="user", content=prompt)])
        )
        return response
    except asyncio.TimeoutError:
        return "Error: The request timed out while translating the sentence."
    except Exception as e:
        return f"Error translating sentence: {e}"


# 对故事进行逐句翻译，并加粗关键词
async def process_story(story, words, progress):
    sentences = story.split('. ')
    translated_story = ""
    for idx, sentence in enumerate(sentences):
        translated_sentence = await translate_sentence(sentence)
        for word in words:
            sentence = sentence.replace(word, f"<b>{word}</b>")
        translated_story += f"{sentence}. <br><br> {translated_sentence}<br><br>"
        progress(0.5 + 0.25 * (idx + 1) / len(sentences))  # 更新进度
        await asyncio.sleep(0.1)  # 控制更新频率，避免性能负担
    return translated_story, sentences


# 拆分单词组并生成漫画风格图片
async def generate_images_for_story(sentences, words, image_prompt, progress):
    images = []
    for i, sentence in enumerate(sentences):
        sentence_words = [word for word in words if word in sentence]
        if not sentence_words:
            continue  # 跳过不包含单词的句子
        combined_prompt = f"{image_prompt} Include elements such as: {', '.join(sentence_words)}, with a whimsical and surreal touch."
        image_path = f'group_{i + 1}.png'
        try:
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: img_model.gen_image(combined_prompt, image_path)
            )
            if os.path.exists(image_path):
                images.append(image_path)
            else:
                images.append("Image generation failed.")
        except Exception as e:
            images.append(f"Image generation failed: {str(e)}")
        progress(0.75 + 0.25 * (i + 1) / len(sentences))  # 更新进度
        await asyncio.sleep(0.1)  # 控制更新频率，避免性能负担
    return images


# 理解图片内容并与故事进行对比
async def understand_and_verify_images(images, sentences):
    verified_images = []
    for i, image_path in enumerate(images):
        if "Image generation failed" in image_path:
            verified_images.append(image_path)
            continue
        try:
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: iu_model.understanding("Describe the image content", image_path)
            )
            if all(word in response for word in sentences[i].split()):
                verified_images.append(image_path)
            else:
                verified_images.append("Image content does not match the story.")
        except asyncio.TimeoutError:
            verified_images.append("Error: The request timed out while understanding the image.")
        except Exception as e:
            verified_images.append(f"Image understanding failed: {str(e)}")
    return verified_images


# 定义从文件上传并随机选择单词的函数
def load_word_list(file):
    try:
        words = []
        with open(file.name, 'r', encoding='utf-8') as f:
            for line in f:
                words.extend(line.strip().split())
        return words
    except Exception as e:
        return f"Error loading word list: {e}"


def get_random_words(word_list, num_words):
    try:
        if len(word_list) < num_words:
            return "单词库中的单词数量不足。"
        random_words = random.sample(word_list, num_words)
        return ' '.join(random_words)
    except Exception as e:
        return f"Error selecting random words: {e}"


# 主函数和Gradio界面
async def process(words, story_prompt, image_prompt, max_length, progress=gr.Progress()):
    word_list = words.split()
    if len(word_list) < 1:
        return "请至少输入一个单词。", None
    story = await generate_segmented_story(word_list, story_prompt, max_length, progress)
    if "Error" in story:
        return story, None
    translated_story, sentences = await process_story(story, word_list, progress)
    images = await generate_images_for_story(sentences, word_list, image_prompt, progress)
    verified_images = await understand_and_verify_images(images, sentences)
    return translated_story, verified_images


def on_file_upload(file, num_words):
    word_list = load_word_list(file)
    if isinstance(word_list, str):
        return word_list  # return error message
    return get_random_words(word_list, num_words)


# 使用 Gradio 创建界面
with gr.Blocks() as demo:
    with gr.Row():
        file_upload = gr.File(label="上传单词库文件", file_types=['txt'])
        num_words = gr.Slider(1, 50, value=30, step=1, label="选择单词数量")
        randomize_button = gr.Button("随机选择单词")

    gr.Markdown("## AI 记单词助手")

    words = gr.Textbox(lines=2, placeholder="请输入单词，用空格分隔（建议30个单词）")
    gr.Markdown("### 可选设置")
    story_prompt = gr.Textbox(lines=2, placeholder="请输入用于生成故事的提示词（可选）")
    image_prompt = gr.Textbox(lines=2, placeholder="请输入用于生成图片的提示词（可选）")

    max_length = gr.Slider(50, 500, value=200, step=10, label="最大生成长度")

    submit_button = gr.Button("生成")

    story_output = gr.HTML(label="生成的故事")
    image_output = gr.Gallery(label="生成的图片")

    randomize_button.click(fn=on_file_upload, inputs=[file_upload, num_words], outputs=words)
    submit_button.click(fn=process, inputs=[words, story_prompt, image_prompt, max_length],
                        outputs=[story_output, image_output])

# 运行 Gradio 应用
if __name__ == '__main__':
    demo.queue().launch(share=True)
