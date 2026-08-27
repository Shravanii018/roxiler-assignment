import { useEffect, useState } from 'react';
import api from '../../api/axios';
import SortableTable from '../../components/SortableTable';

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', address: '', owner_id: '' });
  const [error, setError] = useState('');

  async function fetchStores() {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    const { data } = await api.get('/admin/stores', { params });
    setStores(data);
  }

  useEffect(() => { fetchStores(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, owner_id: form.owner_id || undefined };
      await api.post('/admin/stores', payload);
      setShowForm(false);
      setForm({ name: '', email: '', address: '', owner_id: '' });
      fetchStores();
    } catch (err) {
      const msgs = err.response?.data?.errors;
      setError(Array.isArray(msgs) ? msgs.join(', ') : (err.response?.data?.message || 'Failed to create store'));
    }
  }

  const columns = [
    { key: 'name', label: 'Store Name' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
    { key: 'owner_id', label: 'Owner User ID', render: (r) => r.owner_id ?? 'None' },
    { key: 'rating', label: 'Rating', render: (r) => r.rating ?? 'No ratings yet' },
  ];

  return (
    <div className="page">
      <h2>Stores</h2>

      <div className="filters">
        <input placeholder="Name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
        <input placeholder="Email" value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
        <input placeholder="Address" value={filters.address} onChange={(e) => setFilters({ ...filters, address: e.target.value })} />
        <button onClick={fetchStores}>Filter</button>
        <button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Add Store'}</button>
      </div>

      {showForm && (
        <form className="inline-form" onSubmit={handleCreate}>
          <input placeholder="Store Name (20-60 chars)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          <input placeholder="Owner User ID (optional)" value={form.owner_id} onChange={(e) => setForm({ ...form, owner_id: e.target.value })} />
          <button type="submit">Create</button>
        </form>
      )}

      {error && <p className="error">{error}</p>}

      <SortableTable columns={columns} rows={stores} defaultSortKey="name" />
    </div>
  );
}
