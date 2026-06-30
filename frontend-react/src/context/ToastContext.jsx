import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();

    setToasts(prev => [...prev, { id, msg, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const remove = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const ICONS = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      <div style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '.5rem',
        pointerEvents: 'none'
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            onClick={() => remove(t.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '.65rem',
              background: 'var(--card2)',
              border: '1px solid var(--border2)',
              borderRadius: 12,
              padding: '.8rem 1.1rem',
              cursor: 'pointer',
              pointerEvents: 'all',
              color: 'var(--text)'
            }}
          >
            <span>{ICONS[t.type]}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}