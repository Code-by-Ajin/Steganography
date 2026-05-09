import { useState, useRef } from 'react';

export default function ExtractModal({ onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [isDrag, setIsDrag] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
    setMessage('');
    setStatus('idle');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDrag(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleExtract = async () => {
    if (!file) { setErrorMsg('Please upload a stego image first.'); setStatus('error'); return; }

    setStatus('loading');
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/decode', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Decode failed');
      }
      setMessage(data.message);
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.message || 'Network error.');
      setStatus('error');
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">🔓 Extract Hidden Message</div>

        <div className="boxes">
          <div>
            <div className="box-label">📁 Input Image</div>
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
                  <div className="uz-icon">🔍</div>
                  <div className="uz-text">Click or drag & drop<br/>Stego Image</div>
                </>
              )}
            </div>
          </div>
          <div>
            <div className="box-label">📜 Extracted Message</div>
            <div className="output-box">
              {status === 'loading' ? (
                <span className="output-placeholder">Extracting...</span>
              ) : message ? (
                message
              ) : (
                <span className="output-placeholder">Hidden message will appear here after extraction...</span>
              )}
            </div>
          </div>
        </div>

        {status === 'loading' ? (
          <div className="processing">
            <div className="spinner" />
            <div className="proc-text">Scanning image for hidden data...</div>
          </div>
        ) : (
          <button className="proc-btn" onClick={handleExtract} disabled={!file || status === 'loading'}>
            🔍 EXTRACT MESSAGE
          </button>
        )}

        {status === 'error' && <div className="err-msg" style={{ display: 'block' }}>{errorMsg}</div>}
      </div>
    </div>
  );
}
