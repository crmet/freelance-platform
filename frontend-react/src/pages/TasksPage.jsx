import { useEffect, useState, useCallback } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function TasksPage() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/tasks');
      setTasks(Array.isArray(data) ? data : []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return (
    <div className="page">
      <div className="container">
        <h1>Tasks</h1>

        {loading
          ? <div>Loading...</div>
          : tasks.map(t => (
              <div key={t._id}>
                {t.title}
              </div>
            ))
        }
      </div>
    </div>
  );
}