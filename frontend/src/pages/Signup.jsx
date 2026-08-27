import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await signup(form);
      navigate('/stores');
    } catch (err) {
      const msgs = err.response?.data?.errors;
      setError(Array.isArray(msgs) ? msgs.join(', ') : (err.response?.data?.message || 'Signup failed'));
    }
  }

  return (
    <div className="form-page">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <label>Name (20-60 characters)</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />

        <label>Address (max 400 characters)</label>
        <textarea name="address" value={form.address} onChange={handleChange} required maxLength={400} />

        <label>Password (8-16 chars, 1 uppercase, 1 special char)</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} required />

        {error && <p className="error">{error}</p>}
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}
