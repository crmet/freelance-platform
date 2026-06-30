import { useEffect, useState, useCallback } from 'react';
import API from '../api';

export default function HomePage() {
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [services, setServices] = useState([]);
  const [freelancers, setFreelancers] = useState([]);

  const loadStats = useCallback(async () => {
  try {
    const { data } = await API.get('/tasks');
    setStats(data);
  } catch {}
}, []);

const loadRecentTasks = useCallback(async () => {
  try {
    const { data } = await API.get('/tasks');
    setRecentTasks(data.filter(t => t.status === 'open').slice(0, 6));
  } catch {}
}, []);

const loadServices = useCallback(async () => {
  try {
    const { data } = await API.get('/services');
    setServices(data || []);
  } catch {}
}, []);

const loadFreelancers = useCallback(async () => {
  try {
    const { data } = await API.get('/users?role=freelancer&limit=8');
    setFreelancers(data || []);
  } catch {}
}, []);

useEffect(() => {
  const loadAll = async () => {
    try {
      const [tasks, services, users] = await Promise.all([
        API.get('/tasks'),
        API.get('/services'),
        API.get('/users?role=freelancer&limit=8')
      ]);

      setRecentTasks(tasks.data?.slice(0, 6) || []);
      setServices(services.data || []);
      setFreelancers(users.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  loadAll();
}, []);

  return <div>Home</div>;
}