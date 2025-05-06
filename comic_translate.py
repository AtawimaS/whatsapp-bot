from PIL import Image, ImageDraw, ImageFont
import matplotlib.pyplot as plt
import cv2
import easyocr
from googletrans import Translator
import asyncio

async def sync_translate(text, dest='id'):
    translator = Translator()
    result = await translator.translate(text, dest=dest)
    return result.text

async def translate_text(text):
    translated = await sync_translate(text)
    return translate_text
    print(translated)

# Membaca gambar
image = Image.open('image-3.png')

reader = easyocr.Reader(['en', 'ch_sim', 'ch_tra', 'th', 'kn', 'ja'])
results = reader.readtext('image-3.png', width_ths=1, slope_ths=0.4, link_threshold=0.4)  

font = ImageFont.truetype("arial.ttf", 16)
draw = ImageDraw.Draw(image)

for (bbox, text, prob) in results:
    (top_left, top_right, bottom_right, bottom_left) = bbox
    top_left = tuple(map(int, top_left))
    bottom_right = tuple(map(int, bottom_right))

    # cv2.rectangle(image, top_left, bottom_right, (0, 0, 255), 2)
    draw.rectangle([top_left, bottom_right], outline=(255, 0, 0), width=2, fill='white')

    translated_text = await translate_text(text)

    # Menambahkan teks terjemahan di dalam bounding box
    text_position = (top_left[0]+5, bottom_left[1]+(int(top_left[1] - bottom_left[1])/2)) 
    draw.text(text_position, translated_text, fill="black", font=font)

# Menyimpan gambar hasil perubahan
plt.imshow(image)
# image.save('translated_comic_page.png')     
