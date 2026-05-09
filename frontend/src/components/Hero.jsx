export default function Hero({ onInsert, onExtract, onHistory }) {
  return (
    <div className="hero">
      <div className="hero-card">
        <h2>Choose Operation</h2>
        <p>Conceal secret messages within images or reveal hidden content using advanced LSB steganography.</p>
        
        <div className="options">
          <button className="option-btn" onClick={onInsert}>
            <span className="icon">🔒</span>
            <div className="label">INSERT</div>
            <div className="desc">Embed a secret message</div>
          </button>
          
          <button className="option-btn" onClick={onExtract}>
            <span className="icon">🔓</span>
            <div className="label">EXTRACT</div>
            <div className="desc">Reveal hidden message</div>
          </button>
        </div>

        <button className="history-btn" onClick={onHistory}>
          📜 View Operation History
        </button>
      </div>
    </div>
  );
}
