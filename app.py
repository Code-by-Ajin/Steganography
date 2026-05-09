from flask import Flask, request, jsonify, send_file, render_template
from PIL import Image
import io, base64
import numpy as np

app = Flask(__name__)

DELIMITER = '<<END>>'
MAX_PIXELS = 4000 * 4000  # ~16 MP limit to prevent OOM


def text_to_bits(text):
    return np.unpackbits(np.frombuffer(text.encode('utf-8'), dtype=np.uint8))


def bits_to_text(bits):
    # Pad to multiple of 8
    remainder = len(bits) % 8
    if remainder:
        bits = np.concatenate([bits, np.zeros(8 - remainder, dtype=np.uint8)])
    chars = np.packbits(bits).tobytes()
    try:
        return chars.decode('utf-8', errors='ignore')
    except Exception:
        return chars.decode('latin-1', errors='ignore')


def encode_message(image, message):
    image = image.convert('RGB')
    if image.width * image.height > MAX_PIXELS:
        image.thumbnail((3000, 3000), Image.LANCZOS)

    arr = np.array(image, dtype=np.uint8)
    flat = arr.flatten()

    bits = text_to_bits(message + DELIMITER)
    if len(bits) > len(flat):
        raise ValueError('Message too long for this image.')

    # Vectorised LSB embed
    flat[:len(bits)] = (flat[:len(bits)] & 0xFE) | bits
    result_arr = flat.reshape(arr.shape)
    return Image.fromarray(result_arr, 'RGB')


def decode_message(image):
    image = image.convert('RGB')
    arr = np.array(image, dtype=np.uint8)
    flat = arr.flatten()

    # Extract LSBs
    lsbs = (flat & 1).astype(np.uint8)
    text = bits_to_text(lsbs)

    if DELIMITER in text:
        return text[:text.index(DELIMITER)]
    raise ValueError('No hidden message found in this image.')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/encode', methods=['POST'])
def encode():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided.'}), 400
    message = request.form.get('message', '').strip()
    if not message:
        return jsonify({'error': 'Message cannot be empty.'}), 400
    try:
        img = Image.open(request.files['image'])
        result = encode_message(img, message)
        buf = io.BytesIO()
        result.save(buf, format='PNG', optimize=False, compress_level=1)
        buf.seek(0)
        return jsonify({'success': True, 'image': base64.b64encode(buf.getvalue()).decode()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/decode', methods=['POST'])
def decode():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided.'}), 400
    try:
        img = Image.open(request.files['image'])
        msg = decode_message(img)
        return jsonify({'success': True, 'message': msg})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/download', methods=['POST'])
def download():
    data = request.get_json()
    img_bytes = base64.b64decode(data.get('image', ''))
    buf = io.BytesIO(img_bytes)
    buf.seek(0)
    return send_file(buf, mimetype='image/png', as_attachment=True,
                     download_name='stego_image.png')


if __name__ == '__main__':
    app.run(debug=True, port=5000, threaded=True)
