import { useEffect, useState, useCallback } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();

  const [unreadCount, setUnreadCount] = useState(0);
  const [chatUnread, setChatUnread] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  const loadNotifCount = useCallback(async () => {
    try {
      const { data } = await API.get('/notifications/unread/count');
      setUnreadCount(data?.count || 0);
    } catch {}
  }, []);

  const loadChatUnread = useCallback(async () => {
    try {
      const { data } = await API.get('/chat/unread/counts');
      if (data && typeof data === 'object') {
        const total = Object.values(data).reduce((a, b) => a + b, 0);
        setChatUnread(total);
      }
    } catch {}
  }, []);

  useEffect(() => {
  if (!user) return;

  const load = async () => {
    try {
      const { data } = await API.get('/notifications/unread/count');
      setUnreadCount(data?.count || 0);
    } catch (err) {
      console.error(err);
    }

    try {
      const { data } = await API.get('/chat/unread/counts');
      const total = Object.values(data || {}).reduce((a, b) => a + b, 0);
      setChatUnread(total);
    } catch (err) {
      console.error(err);
    }
  };

  load();

  const interval = setInterval(load, 30000);
  return () => clearInterval(interval);
}, [user]);

  return (
    <div>
      <button onClick={() => setNotifOpen(v => !v)}>
        🔔 {unreadCount + chatUnread}
      </button>
    </div>
  );
}