// src/pages/TimeOff.jsx
import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Modal from '../components/Modal.jsx';

const EMPTY = { leaveType: 'Paid', startDate: '', endDate: '', remarks: '' };

function MyTimeOff() {
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    api.get('/leave/me').then(({ data }) => setLeaves(data.leaves)).catch((e) => setError(e.message));
    api.get('/leave/balance/me').then(({ data }) => setBalance(data.balance)).catch(() => {});
  }
  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/leave', form);
      setShowNew(false);
      setForm(EMPTY);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="section-header">
        <h2>Time Off</h2>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>+ New Request</button>
      </div>

      <div className="stat-row">
        <div className="stat-card accent-blue">
          <span className="stat-value">{balance?.paid ?? '—'}</span>
          <span className="stat-label">Paid Time Off — Days Available</span>
        </div>
        <div className="stat-card accent-green">
          <span className="stat-value">{balance?.sick ?? '—'}</span>
          <span className="stat-label">Sick Time Off — Days Available</span>
        </div>
        <div className="stat-card accent-amber">
          <span className="stat-value">{leaves.filter((l) => l.status === 'Pending').length}</span>
          <span className="stat-label">Pending Requests</span>
        </div>
      </div>

      {error && !showNew && <div className="alert alert-error">{error}</div>}

      <div className="card table-card">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Type</th><th>Start Date</th><th>End Date</th><th>Remarks</th><th>Status</th></tr></thead>
          <tbody>
            {leaves.length === 0 && <tr><td colSpan={6} className="muted" style={{ textAlign: 'center' }}>No time-off requests yet.</td></tr>}
            {leaves.map((l) => (
              <tr key={l.id}>
                <td>You</td>
                <td>{l.leaveType} Time Off</td>
                <td>{new Date(l.startDate).toLocaleDateString('en-IN')}</td>
                <td>{new Date(l.endDate).toLocaleDateString('en-IN')}</td>
                <td className="muted">{l.remarks || '—'}{l.adminComment && <div><em>HR: {l.adminComment}</em></div>}</td>
                <td><StatusBadge status={l.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showNew && (
        <Modal title="New Time Off Request" onClose={() => setShowNew(false)}>
          <form className="stacked-form" onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}
            <label>Time Off Type
              <select value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })}>
                <option value="Paid">Paid Time Off</option>
                <option value="Sick">Sick Time Off</option>
                <option value="Unpaid">Unpaid Leave</option>
              </select>
            </label>
            <div className="form-row">
              <label>Start Date
                <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </label>
              <label>End Date
                <input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </label>
            </div>
            <label>Remarks
              <textarea rows={3} value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} placeholder="Add any additional context for HR…" />
            </label>
            <button className="btn btn-primary btn-block" type="submit" disabled={saving}>{saving ? 'Submitting…' : 'Submit'}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function AllTimeOff() {
  const [leaves, setLeaves] = useState([]);
  const [error, setError] = useState('');
  const [actioning, setActioning] = useState(null);
  const [comment, setComment] = useState('');

  function load() {
    api.get('/leave').then(({ data }) => setLeaves(data.leaves)).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  async function decide(id, status) {
    setError('');
    try {
      await api.put(`/leave/${id}/status`, { status, adminComment: comment });
      setActioning(null);
      setComment('');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const pending = leaves.filter((l) => l.status === 'Pending');
  const decided = leaves.filter((l) => l.status !== 'Pending');

  return (
    <div className="page">
      <div className="section-header"><h2>Time Off Requests</h2></div>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="stat-row">
        <div className="stat-card accent-amber"><span className="stat-value">{pending.length}</span><span className="stat-label">Pending Approval</span></div>
        <div className="stat-card accent-green"><span className="stat-value">{leaves.filter((l) => l.status === 'Approved').length}</span><span className="stat-label">Approved</span></div>
        <div className="stat-card accent-red"><span className="stat-value">{leaves.filter((l) => l.status === 'Rejected').length}</span><span className="stat-label">Rejected</span></div>
      </div>

      <h4 className="subhead">Pending Requests</h4>
      <div className="card table-card">
        <table className="data-table">
          <thead><tr><th>Employee</th><th>Type</th><th>Start</th><th>End</th><th>Remarks</th><th>Action</th></tr></thead>
          <tbody>
            {pending.length === 0 && <tr><td colSpan={6} className="muted" style={{ textAlign: 'center' }}>No pending requests. All caught up!</td></tr>}
            {pending.map((l) => (
              <tr key={l.id}>
                <td>{l.employeeName}</td>
                <td>{l.leaveType} Time Off</td>
                <td>{new Date(l.startDate).toLocaleDateString('en-IN')}</td>
                <td>{new Date(l.endDate).toLocaleDateString('en-IN')}</td>
                <td className="muted">{l.remarks || '—'}</td>
                <td>
                  {actioning === l.id ? (
                    <div className="inline-approve">
                      <input placeholder="Comment (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
                      <button className="btn btn-primary btn-sm" onClick={() => decide(l.id, 'Approved')}>Approve</button>
                      <button className="btn btn-danger btn-sm" onClick={() => decide(l.id, 'Rejected')}>Reject</button>
                      <button className="icon-btn" onClick={() => { setActioning(null); setComment(''); }}>✕</button>
                    </div>
                  ) : (
                    <button className="btn btn-secondary btn-sm" onClick={() => setActioning(l.id)}>Review</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4 className="subhead">History</h4>
      <div className="card table-card">
        <table className="data-table">
          <thead><tr><th>Employee</th><th>Type</th><th>Start</th><th>End</th><th>Status</th><th>Comment</th></tr></thead>
          <tbody>
            {decided.length === 0 && <tr><td colSpan={6} className="muted" style={{ textAlign: 'center' }}>No decisions recorded yet.</td></tr>}
            {decided.map((l) => (
              <tr key={l.id}>
                <td>{l.employeeName}</td>
                <td>{l.leaveType} Time Off</td>
                <td>{new Date(l.startDate).toLocaleDateString('en-IN')}</td>
                <td>{new Date(l.endDate).toLocaleDateString('en-IN')}</td>
                <td><StatusBadge status={l.status} /></td>
                <td className="muted">{l.adminComment || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function TimeOff() {
  const { user } = useAuth();
  return user?.role === 'admin' ? <AllTimeOff /> : <MyTimeOff />;
}
