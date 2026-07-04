// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
}

const STATUS_ICON = { Present: '🟢', OnLeave: '✈️', Absent: '🟡', 'Half-day': '🟡' };

function EmployeeGrid() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/users').then(({ data }) => setUsers(data.users)).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const counts = users.reduce(
    (acc, u) => {
      acc[u.todayStatus] = (acc[u.todayStatus] || 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <>
      <div className="stat-row">
        <div className="stat-card">
          <span className="stat-value">{users.length}</span>
          <span className="stat-label">Total Employees</span>
        </div>
        <div className="stat-card accent-green">
          <span className="stat-value">{counts.Present || 0}</span>
          <span className="stat-label">Present Today</span>
        </div>
        <div className="stat-card accent-amber">
          <span className="stat-value">{counts.Absent || 0}</span>
          <span className="stat-label">Absent Today</span>
        </div>
        <div className="stat-card accent-blue">
          <span className="stat-value">{counts.OnLeave || 0}</span>
          <span className="stat-label">On Leave</span>
        </div>
      </div>

      <div className="section-header">
        <h2>Employees</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <p className="muted">Loading employees…</p>
      ) : (
        <div className="employee-card-grid">
          {users.map((u) => (
            <button className="employee-card" key={u.id} onClick={() => navigate(`/employees/${u.id}`)}>
              <span className="employee-status-dot" title={u.todayStatus}>{STATUS_ICON[u.todayStatus] || '🟡'}</span>
              <span className="avatar-circle large">{initials(u.name)}</span>
              <span className="employee-card-name">{u.name}</span>
              <span className="employee-card-role">{u.jobPosition || u.role}</span>
              <span className="employee-card-dept">{u.department}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function EmployeeQuickAccess() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [today, setToday] = useState(null);
  const [balance, setBalance] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function refresh() {
    api.get('/attendance/me').then(({ data }) => setToday(data.today)).catch(() => {});
    api.get('/leave/balance/me').then(({ data }) => setBalance(data.balance)).catch(() => {});
  }

  useEffect(refresh, []);

  async function handleCheck() {
    setBusy(true);
    setError('');
    try {
      if (today?.checkIn && !today?.checkOut) {
        await api.post('/attendance/check-out');
      } else {
        await api.post('/attendance/check-in');
      }
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const isCheckedIn = today?.checkIn && !today?.checkOut;

  return (
    <>
      <div className="welcome-banner">
        <div>
          <h2>Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
          <p className="muted">Here's what's happening with your workday.</p>
        </div>
        <div className="checkin-widget">
          <div className="checkin-times">
            <div><span className="muted">Check In</span><strong>{today?.checkIn || '--:--'}</strong></div>
            <div><span className="muted">Check Out</span><strong>{today?.checkOut || '--:--'}</strong></div>
          </div>
          <button className={`btn ${isCheckedIn ? 'btn-danger' : 'btn-primary'}`} onClick={handleCheck} disabled={busy}>
            {isCheckedIn ? 'Check Out →' : 'Check In →'}
          </button>
        </div>
      </div>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="section-header"><h2>Quick Access</h2></div>
      <div className="quick-card-grid">
        <button className="quick-card" onClick={() => navigate('/profile')}>
          <span className="quick-card-icon">👤</span>
          <span>Profile</span>
        </button>
        <button className="quick-card" onClick={() => navigate('/attendance')}>
          <span className="quick-card-icon">🗓️</span>
          <span>Attendance</span>
        </button>
        <button className="quick-card" onClick={() => navigate('/time-off')}>
          <span className="quick-card-icon">🧳</span>
          <span>Leave Requests</span>
        </button>
        <button className="quick-card" onClick={() => navigate('/settings')}>
          <span className="quick-card-icon">⚙️</span>
          <span>Settings</span>
        </button>
      </div>

      <div className="section-header"><h2>Time Off Balance</h2></div>
      <div className="stat-row">
        <div className="stat-card accent-blue">
          <span className="stat-value">{balance?.paid ?? '—'}</span>
          <span className="stat-label">Paid Time Off Days Available</span>
        </div>
        <div className="stat-card accent-green">
          <span className="stat-value">{balance?.sick ?? '—'}</span>
          <span className="stat-label">Sick Time Off Days Available</span>
        </div>
        <div className="stat-card">
          <span className="stat-value"><StatusBadge status={today?.checkIn ? (today.checkOut ? 'Present' : 'Present') : 'Absent'} /></span>
          <span className="stat-label">Today's Status</span>
        </div>
      </div>
    </>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <div className="page">
      {user?.role === 'admin' ? <EmployeeGrid /> : <EmployeeQuickAccess />}
    </div>
  );
}
