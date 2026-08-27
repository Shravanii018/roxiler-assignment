import { useEffect, useState } from 'react';
import api from '../api/axios';
import SortableTable from '../components/SortableTable';
import { useAuth } from '../context/AuthContext';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/owner/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'));
  }, []);

  if (error) return (
    <div className="page">
      <p className="error">{error}</p>
      {user && (
        <p style={{ marginTop: '1.5rem', color: '#555' }}>
          Please provide your User ID to the administrator to link your store: <strong>{user.id}</strong>
        </p>
      )}
    </div>
  );
  if (!data) return <div className="page"><p>Loading...</p></div>;

  const columns = [
    { key: 'name', label: 'User Name' },
    { key: 'email', label: 'Email' },
    { key: 'rating', label: 'Rating Given' },
  ];

  return (
    <div className="page">
      <h2>{data.store.name}</h2>
      <p>{data.store.address}</p>
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-value">{data.averageRating ?? 'No ratings yet'}</div>
          <div className="stat-label">Average Rating</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.raters.length}</div>
          <div className="stat-label">Total Raters</div>
        </div>
      </div>
      <h3>Users who rated your store</h3>
      <SortableTable columns={columns} rows={data.raters} defaultSortKey="name" />
    </div>
  );
}
