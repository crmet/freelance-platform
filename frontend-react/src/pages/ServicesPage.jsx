import { useEffect, useState, useCallback } from 'react';
import API from '../api';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadServices = useCallback(async () => {
  setLoading(true);
  try {
    const { data } = await API.get('/services');
    setServices(Array.isArray(data) ? data : []);
  } catch {}
  setLoading(false);
}, []);

useEffect(() => {
  const load = async () => {
    setLoading(true);

    try {
      const { data } = await API.get('/services');
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  load();
}, []);

  return <div>Services</div>;
}