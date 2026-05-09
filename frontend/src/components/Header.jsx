import { useState, useRef, useEffect } from 'react';

const THEMES = [
  { id: 'black', name: 'BLACK', desc: 'Dark cosmic' },
  { id: 'white', name: 'WHITE', desc: 'Clean light' },
  { id: 'grey',  name: 'GREY',  desc: 'Subtle mist' },
  { id: 'blue',  name: 'BLUE',  desc: 'Ocean depth' },
];

export default function Header({ theme, setTheme }) {
  const [open, setOpen] = useState(false);
  const popupRef = useRef(null);
  const btnRef   = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (open && !popupRef.current?.contains(e.target) && !btnRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [open]);

  return (
    <header className="site-header">
      <div className="title-wrap">
        <div className="title-main">STEGANOGRAPHY</div>
        <div className="title-sub">Hide Messages Inside Images</div>
      </div>

      <button ref={btnRef} className="theme-toggle" onClick={() => setOpen(o => !o)} title="Change Theme">
        🎨
      </button>

      {open && (
        <div ref={popupRef} className="theme-popup">
          <div className="theme-popup-title">Choose Theme</div>
          {THEMES.map(t => (
            <div
              key={t.id}
              className={`theme-card ${theme === t.id ? 'active' : ''}`}
              onClick={() => { setTheme(t.id); setOpen(false); }}
            >
              <div className={`tc-swatch ${t.id}`} />
              <div className="tc-info">
                <div className="tc-name">{t.name}</div>
                <div className="tc-desc">{t.desc}</div>
              </div>
              <span className="tc-check">✓</span>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
