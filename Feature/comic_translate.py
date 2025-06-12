from PIL import Image, ImageDraw, ImageFont
import easyocr
import matplotlib.pyplot as plt
from googletrans import Translator
import numpy as np
import base64
from io import BytesIO
from google import genai
from google.genai import types
import asyncio
import re
import json


async def comic_translating(image_file, dest='id'):
    with open(r'testing\api copy.json', 'r') as file:
        api = json.load(file)
        print(api)
    def sync_translate(text, dest=dest):
        dest = 'id'
        translate_list = ['And then', 'they told the police,', 'Anywho, how are', '"No, there arent 50 people at', 'your new classes?', 'the', 'sorority house; just 49""', 'Totally crazy; am', 'right?l', 'Theyre okay-', 'So Umm; can | ask', 'you', 'something ', 'Mhmm_', 'Shootl', 'get that were roommates every', 'Well;', 'yeahl Who else would 1 be', 'year, but is it', 'necessary to be', 'Zoommates with? Since', 'youre not on', 'roommates virtually', 'campus, | got like two more hours', 'worth of stories to sharel', 'Oh', 'joy-']
        sytem_prompting = f"""
        you're a best ai comic translator, you will translate the text into that destination language, with following this step
        1. read the text
        2. identify what language it is
        3. translate the text into {dest} language
        4. return the text in json format, with key "language" and value is the language of the text 
        5. return the text in json format, with key "text" and value is the translated text

        Example output:
        {{
            "language": "English",
            "text": [
                "Halo, nama saya John.",
                "Saya baru saja makan pizza.",
                "Ya, saya sudah makan nasi goreng dengan teman saya.",
                "Nasi goreng adalah makanan yang enak dan populer di Indonesia."
            ]
        }}
        output with key text, is list if have more than one sentence, and length of list is same with input text
        translate this list {translate_list} of text to {dest} language
        """
        client = genai.Client(api_key=api['gemini_api'])
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=[
                sytem_prompting
            ]
        )
        text = response.text
        def take_json(text):
            # Ambil isi JSON dari string
            teks1 = text.split("{", 1)
            teks2 = teks1[1].rsplit("}", 1) 
            json_str = "{" + teks2[0] + "}"

            cleaned_json_str = re.sub(r'\n', '', json_str)

            
            return json.loads(cleaned_json_str)
        return take_json(text)

    def take_color(img, x=5, y=5):
        # img = Image.open(image_path)
        return img.getpixel((x, y))

# async def main():
    print("Open Gambar 📖")
    image = Image.open(image_file).convert("RGBA")
    image_np = np.array(image)
    draw_image = ImageDraw.Draw(image)

    reader = easyocr.Reader(['en'])
    print("make bounding box, and read text")
    results = reader.readtext(image_np, width_ths=2, slope_ths=0.4, link_threshold=0.4)
    print("berhasil buat bounding box etc")
    font = ImageFont.truetype("arial.ttf", 16)
    top_left = results[0][0][0]
    x = top_left[0]
    y = top_left[1]
    color = take_color(image, x=x, y=y)
    all_text = []
    # Memproses bounding box dan mengganti teks
    for (_, text, _) in results:
        all_text.append(text)
    print(len(all_text))
    print('translating text')
    translated_json = sync_translate(all_text)
    try:
        translated_text = translated_json['text']
    except:
        print("failed for translated text")
    print(len(translated_text))
    print("implement to image")
    for idx,(bbox, text, prob) in enumerate(results):
        (top_left, top_right, bottom_right, bottom_left) = bbox
        top_left = tuple(map(int, top_left))
        bottom_right = tuple(map(int, bottom_right))

        x, y = top_right[0] + 1, bottom_left[1] + 8
        draw_image.rectangle([top_left, bottom_right], fill=color)
        text_position = (top_left[0] + 5, bottom_left[1] + (int(top_left[1] - bottom_left[1]) / 2) - 10)
        draw_image.text(text_position, translated_text[idx], fill="black", font=font)

    # Menyimpan gambar hasil perubahan  
    plt.imshow(image)
    image.save('translated_comic_page1.png')
    print("BERHASIL AKSES FUNCTION INI!!!!!")
    buffered = BytesIO()  
    image.save(buffered, format="PNG")  
    img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")  # Konversi buffer ke base64
    return img_base64
