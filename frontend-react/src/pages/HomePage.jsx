import { useEffect, useState } from 'react';
import API from '../api';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [services, setServices] = useState([]);
  const [freelancers, setFreelancers] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        const [tasksRes, servicesRes, usersRes] = await Promise.all([
          API.get('/tasks'),
          API.get('/services'),
          API.get('/users?role=freelancer&limit=8'),
        ]);

        const tasks = tasksRes.data || [];
        const servicesData = servicesRes.data || [];
        const users = usersRes.data || [];

        setStats({
          totalTasks: tasks.length,
          openTasks: tasks.filter(t => t.status === 'open').length,
          totalServices: servicesData.length,
          totalFreelancers: users.length,
        });

        setRecentTasks(tasks.filter(t => t.status === 'open').slice(0, 6));
        setServices(servicesData.slice(0, 6));
        setFreelancers(users.slice(0, 8));
      } catch (err) {
        console.error('Home load error:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>Dashboard</h1>

      {/* STATS */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div>Tasks: {stats?.totalTasks}</div>
        <div>Open: {stats?.openTasks}</div>
        <div>Services: {stats?.totalServices}</div>
        <div>Freelancers: {stats?.totalFreelancers}</div>
      </div>

      {/* TASKS */}
      <h2>Recent Tasks</h2>
      {recentTasks.map(t => (
        <div key={t._id} style={{ padding: 8, borderBottom: '1px solid #ddd' }}>
          {t.title || 'No title'}
        </div>
      ))}

      {/* SERVICES */}
      <h2>Services</h2>
      {services.map(s => (
        <div key={s._id} style={{ padding: 8, borderBottom: '1px solid #ddd' }}>
          {s.title || 'Service'}
        </div>
      ))}

      {/* FREELANCERS */}
      <h2>Freelancers</h2>
      {freelancers.map(f => (
        <div key={f._id} style={{ padding: 8, borderBottom: '1px solid #ddd' }}>
          {f.name || 'User'}
        </div>
      ))}
    </div>
  );
}