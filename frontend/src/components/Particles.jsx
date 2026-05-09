import { useEffect, useRef } from 'react';

const COLORS = ['#7c3aed', '#06b6d4', '#8b5cf6', '#22d3ee'];

export default function Particles() {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 6 + 3;
      p.style.cssText = `
        width:${size}px; height:${size}px;
        left:${Math.random() * 100}%;
        background:${COLORS[Math.floor(Math.random() * COLORS.length)]};
        animation-duration:${Math.random() * 15 + 8}s;
        animation-delay:${Math.random() * 10}s;
      `;
      container.appendChild(p);
    }
    return () => { container.innerHTML = ''; };
  }, []);

  return <div id="particles" ref={ref} />;
}
