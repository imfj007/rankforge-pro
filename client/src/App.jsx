import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import { getTheme, setTheme as saveTheme } from './utils/helpers';

function App() {
  const [theme, setThemeState] = useState(getTheme());

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  return (
    <div className={theme === 'light' ? 'light-mode' : ''}>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Router>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#111128',
            color: '#E2E0F0',
            border: '1px solid #1E1E3A',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '13px',
          },
          success: {
            iconTheme: { primary: '#00FF94', secondary: '#111128' },
          },
          error: {
            iconTheme: { primary: '#FF4D4D', secondary: '#111128' },
          },
        }}
      />
    </div>
  );
}

export default App;
