import { useState } from 'react';
import api from '../api/axios';

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const { data } = await api.put('/auth/password', { oldPassword, newPassword });
      setMessage(data.message);
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    }
  }

  return (
    <div className="form-page">
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit}>
        <label>Current Password</label>
        <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />

        <label>New Password (8-16 chars, 1 uppercase, 1 special char)</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
        <button type="submit">Update Password</button>
      </form>
    </div>
  );
}
