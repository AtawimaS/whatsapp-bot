from PIL import Image, ImageDraw, ImageFont
import easyocr
import matplotlib.pyplot as plt
from googletrans import Translator
import numpy as np
import base64
from io import BytesIO


async def comic_translating(image_file, dest='id'):
    async def sync_translate(text, dest=dest):
        try:
            translator = Translator()
            result = await translator.translate(text, dest=dest)
            return result.text
        except Exception as e:
            print(f"Error during translation: {e}")
            return text

    async def translate_text(text):
        translated = await sync_translate(text)
        return translated
        # print(translated)

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

    # Memproses bounding box dan mengganti teks
    for (bbox, text, prob) in results:
        (top_left, top_right, bottom_right, bottom_left) = bbox
        top_left = tuple(map(int, top_left))
        bottom_right = tuple(map(int, bottom_right))

        x, y = top_right[0] + 1, bottom_left[1] + 8
        translated_text = await translate_text(text)

        draw_image.rectangle([top_left, bottom_right], fill=color)
        text_position = (top_left[0] + 5, bottom_left[1] + (int(top_left[1] - bottom_left[1]) / 2) - 10)
        draw_image.text(text_position, translated_text, fill="black", font=font)

    # Menyimpan gambar hasil perubahan  
    plt.imshow(image)
    # image.save('translated_comic_page1.png')
    print("BERHASIL AKSES FUNCTION INI!!!!!")
    buffered = BytesIO()  
    image.save(buffered, format="PNG")  
    img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")  # Konversi buffer ke base64
    return img_base64
