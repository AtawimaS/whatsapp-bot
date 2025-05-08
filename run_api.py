from flask import Flask, request, jsonify
import base64
import io
from comic_translate import comic_translating
import asyncio

app = Flask(__name__)
@app.route("/comic", methods=['POST'])
def comic():
    print("=== REQUEST MASUK ===")
    if request.is_json:
        data = request.get_json()
        base64_gambar = data.get("gambar")
        destination_translate = data.get("dest")
        try:
            gambar = base64.b64decode(base64_gambar, validate=False)
            image_file = io.BytesIO(gambar)
            img_base64 = asyncio.run(comic_translating(image_file, destination_translate))
            return jsonify({"image": img_base64})
        except Exception as e:
            print("error: akses gambar", e)
            return jsonify({"status": "error", "message": "Invalid image data"}), 400
    else:
        return jsonify({"status": "error", "message": "Expected JSON"}), 400
    

app.run(debug=True, port = 5000)
