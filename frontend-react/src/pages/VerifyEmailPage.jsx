import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../api';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { setStatus('error'); return; }

    API.get(`/auth/verify/${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '80vh', padding: '2rem'
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '3rem 2rem', maxWidth: 440,
        width: '100%', textAlign: 'center'
      }}>
        {status === 'loading' && (
          <>
            <div className="spinner" style={{ margin: '0 auto 1.5rem' }} />
            <p style={{ color: 'var(--text2)' }}>Проверяем ссылку...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ marginBottom: '.5rem' }}>Email подтверждён!</h2>
            <p style={{ color: 'var(--text2)', marginBottom: '2rem', lineHeight: 1.6 }}>
              Ваш аккаунт активирован. Теперь вы можете пользоваться всеми функциями платформы.
            </p>
            <button className="btn btn-primary w-full" onClick={() => navigate('/')}>
              Перейти на главную
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ marginBottom: '.5rem' }}>Ссылка недействительна</h2>
            <p style={{ color: 'var(--text2)', marginBottom: '2rem', lineHeight: 1.6 }}>
              Ссылка истекла или уже была использована. Запросите новое письмо в настройках аккаунта.
            </p>
            <button className="btn btn-primary w-full" onClick={() => navigate('/')}>
              На главную
            </button>
          </>
        )}
      </div>
    </div>
  );
}