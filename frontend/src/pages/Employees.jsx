// src/pages/Settings.jsx
import { useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext.jsx';

export default function Settings() {
  const { user } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    if (form.newPassword !== form.confirm) {
      setError('New password and confirmation do not match.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/auth/change-password', form);
      setNotice('Password updated successfully.');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="section-header"><h2>Settings</h2></div>

      <div className="card" style={{ maxWidth: 480 }}>
        <h4 className="subhead">Account</h4>
        <div className="detail-grid">
          <div className="detail-field"><span className="detail-label">Login ID</span><span className="detail-value">{user?.employeeCode}</span></div>
          <div className="detail-field"><span className="detail-label">Email</span><span className="detail-value">{user?.email}</span></div>
          <div className="detail-field"><span className="detail-label">Role</span><span className="detail-value">{user?.role === 'admin' ? 'Admin / HR Officer' : 'Employee'}</span></div>
        </div>

        <h4 className="subhead">Security — Change Password</h4>
        <form className="stacked-form" onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          {notice && <div className="alert alert-success">{notice}</div>}
          <label>Current Password
            <input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} required={!user?.mustChangePassword} />
          </label>
          <label>New Password
            <input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required minLength={6} />
          </label>
          <label>Confirm New Password
            <input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required minLength={6} />
          </label>
          <p className="field-hint">At least 6 characters, with one letter and one number.</p>
          <button className="btn btn-primary btn-block" type="submit" disabled={saving}>{saving ? 'Updating…' : 'Update Password'}</button>
        </form>
      </div>
    </div>
  );
}
