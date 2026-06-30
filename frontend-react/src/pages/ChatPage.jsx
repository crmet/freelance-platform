import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import API from '../api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export default function ChatPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const currentRoomRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [currentOther, setCurrentOther] = useState(null);
  const [msgText, setMsgText] = useState('');
  const [convSearch, setConvSearch] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});

  const loadConversations = useCallback(async () => {
    try {
      const { data } = await API.get('/chat/conversations/list');
      setConversations(data || []);
    } catch {}
  }, []);

  const openChatWithContext = useCallback(async (userId) => {
    if (!userId || userId === user?.id) return;

    const room = [user.id, userId].sort().join('_');

    setCurrentRoom(room);
    currentRoomRef.current = room;

    try {
      const { data: other } = await API.get(`/users/${userId}`);
      setCurrentOther(other);

      socketRef.current?.emit('join_room', room);

      const { data: msgs } = await API.get(`/chat/${room}`);
      setMessages(msgs || []);
    } catch {}
  }, [user]);

  const sendMessage = useCallback(() => {
    const text = msgText.trim();
    if (!text || !currentRoom) return;

    socketRef.current?.emit('send_message', {
      room: currentRoom,
      senderId: user.id,
      text
    });

    setMsgText('');
  }, [msgText, currentRoom, user]);

  useEffect(() => {
  if (!user) return;

  const socket = io(SOCKET_URL);
  socketRef.current = socket;

  socket.on('receive_message', (msg) => {
    if (msg.room === currentRoomRef.current) {
      setMessages(prev => [...prev, msg]);
    }
  });

  const init = async () => {
    await loadConversations();

    const targetUser = searchParams.get('user');
    if (targetUser) {
      await openChatWithContext(targetUser);
    }
  };

  init();

  return () => socket.disconnect();
}, [user, loadConversations, openChatWithContext, searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div>
      <div>
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.sender?.name || 'User'}:</b> {m.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <textarea
        value={msgText}
        onChange={e => setMsgText(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}