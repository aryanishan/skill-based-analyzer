import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--surface-card)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-soft)',
                borderRadius: '16px',
                fontSize: '14px',
                boxShadow: '0 18px 38px rgba(15, 23, 42, 0.14)',
              },
              success: { iconTheme: { primary: '#0f766e', secondary: '#fff' } },
              error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
