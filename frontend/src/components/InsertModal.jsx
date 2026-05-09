import { useState, useRef } from 'react';

export default function InsertModal({ onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [resultImg, setResultImg] = useState(null);
  const [isDrag, setIsDrag] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDrag(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleEncode = async () => {
    if (!file) { setErrorMsg('Please upload an image first.'); setStatus('error'); return; }
    if (!message.trim()) { setErrorMsg('Please enter a secret message.'); setStatus('error'); return; }

    setStatus('loading');
    const formData = new FormData();
    formData.append('image', file);
    formData.append('message', message);

    try {
      const res = await fetch('/api/encode', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Encode failed');
      }
      const blob = await res.blob();
      setResultImg(URL.createObjectURL(blob));
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.message || 'Network error.');
      setStatus('error');
    }
  };

  const handleSave = () => {
    if (!resultImg) return;
    const a = document.createElement('a');
    a.href = resultImg;
    a.download = 'stego_image.png';
    a.click();
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">🔒 Insert Secret Message</div>

        <div className="boxes">
          <div>
            <div className="box-label">📁 Upload Image</div>
            <div
              className={`upload-zone ${isDrag ? 'drag' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
              onDragLeave={() => setIsDrag(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={(e) => handleFile(e.target.files[0])}
              />
              {preview ? (
                <img src={preview} alt="Preview" />
              ) : (
                <>
                  <div className="uz-icon">🖼️</div>
                  <div className="uz-text">Click or drag & drop<br/>PNG / JPG / BMP</div>
                </>
              )}
            </div>
          </div>
          <div>
            <div className="box-label">✉️ Secret Message</div>
            <textarea
              className="msg-area"
              placeholder="Type your secret message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        {status === 'loading' ? (
          <div className="processing">
            <div className="spinner" />
            <div className="proc-text">Embedding message into image...</div>
          </div>
        ) : status === 'success' ? (
          <div className="result-area" style={{ display: 'block' }}>
            <div className="result-badge">✅ Process Completed!</div><br />
            <img className="result-img" src={resultImg} alt="Encoded" /><br />
            <button className="save-btn" onClick={handleSave}>💾 Save Image</button>
          </div>
        ) : (
          <button className="proc-btn" onClick={handleEncode} disabled={!file || !message.trim()}>
            ⚡ PROCEED
          </button>
        )}

        {status === 'error' && <div className="err-msg" style={{ display: 'block' }}>{errorMsg}</div>}
      </div>
    </div>
  );
}
