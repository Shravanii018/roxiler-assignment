import { useEffect, useState } from 'react';
import api from '../../api/axios';
import SortableTable from '../../components/SortableTable';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', role: 'normal' });
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');

  async function fetchUsers() {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    const { data } = await api.get('/admin/users', { params });
    setUsers(data);
  }

  useEffect(() => { fetchUsers(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/admin/users', form);
      setShowForm(false);
      setForm({ name: '', email: '', address: '', password: '', role: 'normal' });
      fetchUsers();
    } catch (err) {
      const msgs = err.response?.data?.errors;
      setError(Array.isArray(msgs) ? msgs.join(', ') : (err.response?.data?.message || 'Failed to create user'));
    }
  }

  async function viewDetail(userId) {
    const { data } = await api.get(`/admin/users/${userId}`);
    setDetail(data);
  }

  const columns = [
    { key: 'id', label: 'User ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
    {
      key: 'role',
      label: 'Role',
      render: (r) => <span className={`role-badge role-${r.role}`}>{r.role}</span>,
    },
    {
      key: 'action',
      label: '',
      render: (r) => <button onClick={() => viewDetail(r.id)}>View</button>,
    },
  ];

  return (
    <div className="page">
      <h2>Users</h2>

      <div className="filters">
        <input placeholder="Name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
        <input placeholder="Email" value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
        <input placeholder="Address" value={filters.address} onChange={(e) => setFilters({ ...filters, address: e.target.value })} />
        <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="normal">Normal User</option>
          <option value="owner">Store Owner</option>
        </select>
        <button onClick={fetchUsers}>Filter</button>
        <button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Add User'}</button>
      </div>

      {showForm && (
        <form className="inline-form" onSubmit={handleCreate}>
          <input placeholder="Name (20-60 chars)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="normal">Normal User</option>
            <option value="admin">Admin</option>
            <option value="owner">Store Owner</option>
          </select>
          <button type="submit">Create</button>
        </form>
      )}

      {error && <p className="error">{error}</p>}

      {detail && (
        <div className="detail-panel">
          <h3>User Details</h3>
          <p><b>User ID:</b> {detail.id}</p>
          <p><b>Name:</b> {detail.name}</p>
          <p><b>Email:</b> {detail.email}</p>
          <p><b>Address:</b> {detail.address}</p>
          <p><b>Role:</b> <span className={`role-badge role-${detail.role}`}>{detail.role}</span></p>
          {detail.role === 'owner' && <p><b>Store Rating:</b> {detail.rating ?? 'No ratings yet'}</p>}
          <button onClick={() => setDetail(null)}>Close</button>
        </div>
      )}

      <SortableTable columns={columns} rows={users} defaultSortKey="name" />
    </div>
  );
}
