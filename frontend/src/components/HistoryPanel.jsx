import { useState, useEffect } from 'react';

export default function HistoryPanel({ onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/history')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setHistory(data.history || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleClear = async () => {
    try {
      await fetch('/api/history', { method: 'DELETE' });
      setHistory([]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">📜 Operation History</div>

        {loading ? (
          <div className="processing">
            <div className="spinner" />
          </div>
        ) : history.length === 0 ? (
          <div className="empty-history">No operations recorded yet.</div>
        ) : (
          <>
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-item">
                  <span className={`history-badge ${item.operation === 'encode' ? 'badge-encode' : 'badge-decode'}`}>
                    {item.operation.toUpperCase()}
                  </span>
                  <div className="history-info">
                    <div className="history-filename">{item.filename}</div>
                    <div className="history-meta">
                      {new Date(item.timestamp).toLocaleString()} • {item.messageLength} chars
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="clear-btn" onClick={handleClear}>🗑️ Clear History</button>
          </>
        )}
      </div>
    </div>
  );
}
