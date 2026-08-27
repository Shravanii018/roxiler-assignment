import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setStats(res.data));
  }, []);

  if (!stats) return <div className="page"><p>Loading...</p></div>;

  return (
    <div className="page">
      <h2>Admin Dashboard</h2>
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-value">{stats.totalUsers}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalStores}</div>
          <div className="stat-label">Total Stores</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalRatings}</div>
          <div className="stat-label">Total Ratings</div>
        </div>
      </div>
    </div>
  );
}
