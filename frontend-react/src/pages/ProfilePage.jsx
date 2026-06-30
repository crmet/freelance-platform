import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!id) return;

    setLoading(true);

    try {
      const { data: userData } = await API.get(`/users/${id}`);
      setProfile(userData || null);

      const [portRes, revRes] = await Promise.allSettled([
        API.get(`/portfolio/${id}`),
        API.get(`/reviews/user/${id}`)
      ]);

      setPortfolio(
        portRes.status === 'fulfilled' && Array.isArray(portRes.value.data)
          ? portRes.value.data
          : []
      );

      const reviewData =
        revRes.status === 'fulfilled' ? revRes.value.data : [];

      setReviews(
        Array.isArray(reviewData)
          ? reviewData
          : reviewData?.reviews || []
      );

      if (userData?.role === 'freelancer' || userData?.role === 'admin') {
        try {
          const { data: svcs } = await API.get(`/services?freelancer=${id}`);
          setServices(Array.isArray(svcs) ? svcs : []);
        } catch {
          setServices([]);
        }
      } else {
        setServices([]);
      }
    } catch (err) {
      console.error('profile load error:', err);
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // если меняется id — сбрасываем состояние (важно для предотвращения "старых данных")
  useEffect(() => {
    setProfile(null);
    setPortfolio([]);
    setReviews([]);
    setServices([]);
    setLoading(true);
  }, [id]);

  if (loading) {
    return <div className="page">Загрузка...</div>;
  }

  if (!profile) {
    return <div className="page">Профиль не найден</div>;
  }

  return (
    <div className="page">
      <div className="container">
        <h1>{profile.name}</h1>
        <p>{profile.bio || 'Нет описания'}</p>

        <div style={{ marginTop: 20 }}>
          <h3>Портфолио</h3>
          {portfolio.length === 0 ? (
            <p>Пусто</p>
          ) : (
            portfolio.map(item => (
              <div key={item._id}>{item.title}</div>
            ))
          )}
        </div>

        <div style={{ marginTop: 20 }}>
          <h3>Отзывы</h3>
          {reviews.length === 0 ? (
            <p>Нет отзывов</p>
          ) : (
            reviews.map(r => (
              <div key={r._id}>
                ⭐ {r.rating} — {r.text}
              </div>
            ))
          )}
        </div>

        {profile.role === 'freelancer' && (
          <div style={{ marginTop: 20 }}>
            <h3>Услуги</h3>
            {services.length === 0 ? (
              <p>Нет услуг</p>
            ) : (
              services.map(s => (
                <div key={s._id}>{s.title}</div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}