import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import CommandPalette from './components/CommandPalette';
import { MoodProvider } from './context/MoodContext';
import { Toaster } from 'sonner';
import './index.css';

function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  React.useEffect(() => {
    const applyTheme = () => {
      const theme = localStorage.getItem('brain_setting_theme') || 'System Default';
      if (theme === 'Light Mode') {
        document.documentElement.classList.add('light-theme');
      } else {
        document.documentElement.classList.remove('light-theme');
      }
    };
    applyTheme();
    window.addEventListener('brain_theme_changed', applyTheme);
    return () => window.removeEventListener('brain_theme_changed', applyTheme);
  }, []);

  return (
    <MoodProvider>
      <Toaster theme="dark" position="top-center" toastOptions={{ style: { background: '#121214', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' } }} />
      <Router>
        <div className="text-foreground bg-background font-sans min-h-screen">
          <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} />
          
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/chat" element={<ChatPage setPaletteOpen={setPaletteOpen} />} />
          </Routes>
        </div>
      </Router>
    </MoodProvider>
  );
}

export default App;
