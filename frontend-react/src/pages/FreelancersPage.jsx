import { useEffect, useState, useCallback } from 'react';
import API from '../api';

export default function FreelancersPage() {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadFreelancers = useCallback(async () => {
  setLoading(true);
  try {
    const { data } = await API.get('/users');
    setFreelancers(
      Array.isArray(data)
        ? data.filter(u => u.role === 'freelancer' || u.role === 'admin')
        : []
    );
  } catch {}
  setLoading(false);
}, []);

useEffect(() => {
  const load = async () => {
    setLoading(true);

    try {
      const { data } = await API.get('/users');
      const fls = (data || []).filter(
        u => u.role === 'freelancer' || u.role === 'admin'
      );

      setFreelancers(fls);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  load();
}, []);
  return <div>Freelancers</div>;
}