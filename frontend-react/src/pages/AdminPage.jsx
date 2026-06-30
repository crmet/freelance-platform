import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('users');

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/tasks');
    }
  }, [user, navigate]);

const loadUsers = useCallback(async () => {
  try {
    const { data } = await API.get('/users');
    setUsers(data || []);
  } catch {}
}, []);

const loadTasks = useCallback(async () => {
  try {
    const { data } = await API.get('/tasks');
    setTasks(data || []);
  } catch {}
}, []);

const loadServices = useCallback(async () => {
  try {
    const { data } = await API.get('/services');
    setServices(data || []);
  } catch {}
}, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadUsers(), loadTasks(), loadServices()]);
    } finally {
      setLoading(false);
    }
  }, [loadUsers, loadTasks, loadServices]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAll();
    }
  }, [user, loadAll]);

  const deleteUser = async (id) => {
    await API.delete(`/users/${id}`);
    loadUsers();
  };

  const deleteTask = async (id) => {
    await API.delete(`/tasks/${id}`);
    loadTasks();
  };

  const deleteService = async (id) => {
    await API.delete(`/services/${id}`);
    loadServices();
  };

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <div className="container">
        <h1>Admin Panel</h1>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setTab('users')}>Users</button>
          <button onClick={() => setTab('tasks')}>Tasks</button>
          <button onClick={() => setTab('services')}>Services</button>
        </div>

        {tab === 'users' && users.map(u => (
          <div key={u._id}>
            {u.name}
            <button onClick={() => deleteUser(u._id)}>Delete</button>
          </div>
        ))}

        {tab === 'tasks' && tasks.map(t => (
          <div key={t._id}>
            {t.title}
            <button onClick={() => deleteTask(t._id)}>Delete</button>
          </div>
        ))}

        {tab === 'services' && services.map(s => (
          <div key={s._id}>
            {s.title}
            <button onClick={() => deleteService(s._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}