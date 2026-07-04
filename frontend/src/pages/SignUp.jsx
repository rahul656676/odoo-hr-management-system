// src/pages/SignUp.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function SignUp() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'employee' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await signup({ name: form.name, email: form.email, password: form.password, role: form.role });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <div className="auth-brand">
          <div className="brand-mark large">OI</div>
          <h1>Orbit HRMS</h1>
          <p>Every workday, perfectly aligned.</p>
        </div>
      </div>
      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Sign up</h2>
          <p className="auth-subtitle">Create your account to get started.</p>

          {error && <div className="alert alert-error">{error}</div>}

          <label>
            Name
            <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} required autoFocus />
          </label>

          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
          </label>

          <label>
            Role
            <select value={form.role} onChange={(e) => update('role', e.target.value)}>
              <option value="employee">Employee</option>
              <option value="admin">HR / Admin</option>
            </select>
          </label>

          <label>
            Password
            <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required minLength={6} />
          </label>

          <label>
            Confirm Password
            <input type="password" value={form.confirm} onChange={(e) => update('confirm', e.target.value)} required minLength={6} />
          </label>

          <p className="field-hint">At least 6 characters, with one letter and one number.</p>

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/signin">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
