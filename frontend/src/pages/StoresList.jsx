import { useEffect, useState } from 'react';
import api from '../api/axios';
import SortableTable from '../components/SortableTable';

export default function StoresList() {
  const [stores, setStores] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  async function fetchStores() {
    try {
      const { data } = await api.get('/stores', { params: { name, address } });
      setStores(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stores');
    }
  }

  useEffect(() => { fetchStores(); }, []);

  async function handleRate(storeId, rating) {
    try {
      await api.post(`/stores/${storeId}/rating`, { rating });
      fetchStores();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    }
  }

  const columns = [
    { key: 'name', label: 'Store Name' },
    { key: 'address', label: 'Address' },
    { key: 'overallRating', label: 'Overall Rating', render: (r) => r.overallRating ?? 'No ratings yet' },
    { key: 'userSubmittedRating', label: 'Your Rating', render: (r) => r.userSubmittedRating ?? '—' },
    {
      key: 'action',
      label: 'Rate this store',
      render: (r) => (
        <select
          value={r.userSubmittedRating || ''}
          onChange={(e) => handleRate(r.id, Number(e.target.value))}
        >
          <option value="" disabled>Select 1-5</option>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      ),
    },
  ];

  return (
    <div className="page">
      <h2>Browse Stores</h2>
      <div className="filters">
        <input placeholder="Search by name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Search by address" value={address} onChange={(e) => setAddress(e.target.value)} />
        <button onClick={fetchStores}>Search</button>
      </div>
      {error && <p className="error">{error}</p>}
      <SortableTable columns={columns} rows={stores} defaultSortKey="name" />
    </div>
  );
}
