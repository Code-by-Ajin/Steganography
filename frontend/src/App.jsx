import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Particles from './components/Particles';
import InsertModal from './components/InsertModal';
import ExtractModal from './components/ExtractModal';
import HistoryPanel from './components/HistoryPanel';

export default function App() {
  const [theme, setTheme] = useState('black');
  const [activeModal, setActiveModal] = useState(null); // 'insert' | 'extract' | 'history' | null

  useEffect(() => {
    document.body.className = theme === 'black' ? '' : theme;
  }, [theme]);

  const close = () => setActiveModal(null);

  return (
    <>
      <Particles />
      <Header theme={theme} setTheme={setTheme} />
      <Hero
        onInsert={() => setActiveModal('insert')}
        onExtract={() => setActiveModal('extract')}
        onHistory={() => setActiveModal('history')}
      />
      {activeModal === 'insert'  && <InsertModal  onClose={close} />}
      {activeModal === 'extract' && <ExtractModal onClose={close} />}
      {activeModal === 'history' && <HistoryPanel onClose={close} />}
    </>
  );
}
