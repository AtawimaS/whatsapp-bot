from PIL import Image, ImageDraw, ImageFont
import easyocr
import matplotlib.pyplot as plt
import numpy as np
from flask import Flask

app = Flask(__name__)


from googletrans import Translator
import asyncio

def sync_translate(text, dest='id'):
    translator = Translator()
    result = translator.translate(text, dest=dest)
    return result.text

def translate_text(text):
    translated = sync_translate(text)
    return translated
    # print(translated)

def take_color(image_path, x=5, y=5):
    img = Image.open(image_path)
    return img.getpixel((x, y))
    # return (r,g,b)

async def main():
    print("Open Gambar 📖")
    image = Image.open('image-3.png').convert("RGBA")

    draw_image = ImageDraw.Draw(image)

    reader = easyocr.Reader(['en'])
    results = reader.readtext('image-3.png', width_ths=2, slope_ths=0.4, link_threshold=0.4)

    font = ImageFont.truetype("arial.ttf", 16)
    top_left = results[0][0][0]
    x = top_left[0]
    y = top_left[1]
    color = take_color('image-3.png', x=x, y=y)

    # Memproses bounding box dan mengganti teks
    for (bbox, text, prob) in results:
        (top_left, top_right, bottom_right, bottom_left) = bbox
        top_left = tuple(map(int, top_left))
        bottom_right = tuple(map(int, bottom_right))

        x, y = top_right[0] + 1, bottom_left[1] + 8
        translated_text = translate_text(text)

        draw_image.rectangle([top_left, bottom_right], fill=color)
        # Asumsi fungsi take_color() sudah didefinisikan dan dapat dipanggil tanpa argumen
        # color_plate = take_color(top_left)
        # print(color, x,y)
        # Menambahkan teks terjemahan di dalam bounding box
        text_position = (top_left[0] + 5, bottom_left[1] + (int(top_left[1] - bottom_left[1]) / 2) - 10)
        draw_image.text(text_position, translated_text, fill="black", font=font)

    # Menyimpan gambar hasil perubahan  
    plt.imshow(image)
    image.save('translated_comic_page1.png')

if __name__ == "__main__":
    main()
