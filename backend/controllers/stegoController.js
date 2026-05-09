const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

// Setup lowdb (local JSON file storage)
const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const adapter = new FileSync(path.join(DATA_DIR, 'history.json'));
const db = low(adapter);
db.defaults({ history: [] }).write();

const DELIMITER = '<<END>>';

function textToBits(text) {
  const bytes = Buffer.from(text, 'utf-8');
  const bits = [];
  for (const byte of bytes) {
    for (let i = 7; i >= 0; i--) bits.push((byte >> i) & 1);
  }
  return bits;
}

function bitsToText(bits) {
  let text = '';
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    text += String.fromCharCode(byte);
  }
  return text;
}

exports.encode = async (req, res) => {
  try {
    const { message } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No image provided.' });
    if (!message?.trim()) return res.status(400).json({ error: 'Message cannot be empty.' });

    const trimmed = message.trim();
    const image = await Jimp.read(req.file.buffer);
    const { width, height } = image.bitmap;
    const bits = textToBits(trimmed + DELIMITER);

    if (bits.length > width * height * 3) {
      return res.status(400).json({ error: 'Message too long for this image.' });
    }

    const data = image.bitmap.data;
    let bitIndex = 0;
    for (let i = 0; i < width * height && bitIndex < bits.length; i++) {
      const idx = i * 4;
      for (let c = 0; c < 3 && bitIndex < bits.length; c++) {
        data[idx + c] = (data[idx + c] & 0xFE) | bits[bitIndex++];
      }
    }

    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);

    db.get('history').unshift({
      id: Date.now().toString(),
      operation: 'encode',
      filename: req.file.originalname || 'unknown',
      messageLength: trimmed.length,
      timestamp: new Date().toISOString(),
    }).write();

    res.set('Content-Type', 'image/png');
    res.set('Content-Disposition', 'attachment; filename="stego_image.png"');
    res.send(buffer);
  } catch (err) {
    console.error('Encode error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.decode = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image provided.' });

    const image = await Jimp.read(req.file.buffer);
    const { width, height } = image.bitmap;
    const data = image.bitmap.data;
    const bits = [];

    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      for (let c = 0; c < 3; c++) bits.push(data[idx + c] & 1);
    }

    const text = bitsToText(bits);
    const delimIdx = text.indexOf(DELIMITER);
    if (delimIdx === -1) {
      return res.status(400).json({ error: 'No hidden message found in this image.' });
    }

    const message = text.slice(0, delimIdx);

    db.get('history').unshift({
      id: Date.now().toString(),
      operation: 'decode',
      filename: req.file.originalname || 'unknown',
      messageLength: message.length,
      timestamp: new Date().toISOString(),
    }).write();

    res.json({ success: true, message });
  } catch (err) {
    console.error('Decode error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getHistory = (req, res) => {
  try {
    const history = db.get('history').take(50).value();
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.clearHistory = (req, res) => {
  try {
    db.set('history', []).write();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
