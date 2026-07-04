// src/pages/Employees.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import Modal from '../components/Modal.jsx';

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
}
const STATUS_ICON = { Present: '●', OnLeave: '●', Absent: '●', 'Half-day': '●' };

const EMPTY_FORM = { name: '', email: '', department: '', jobPosition: '', role: 'employee', dateOfJoining: '' };

export default function Employees() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdInfo, setCreatedInfo] = useState(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  function load() {
    setLoading(true);
    api.get('/users').then(({ data }) => setUsers(data.users)).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  useEffect(() => {
    setQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.name, u.email, u.department, u.jobPosition, u.employeeCode].join(' ').toLowerCase().includes(q)
    );
  }, [users, query]);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const { data } = await api.post('/users', form);
      setCreatedInfo({ code: data.user.employeeCode, password: data.temporaryPassword, name: data.user.name });
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="page">
      <div className="section-header">
        <h2>Employees</h2>
        <button className="btn btn-primary" onClick={() => { setShowAdd(true); setCreatedInfo(null); }}>+ New Employee</button>
      </div>

      <div className="search-bar">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6"/><path d="M21 21l-4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
        <input
          placeholder="Search by name, department, employee ID..."
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            if (value.trim()) setSearchParams({ search: value });
            else setSearchParams({});
          }}
        />
      </div>

      {error && !showAdd && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p className="muted">Loading employees...</p>
      ) : (
        <div className="employee-card-grid">
          {filtered.map((u) => (
            <button className="employee-card" key={u.id} onClick={() => navigate(`/employees/${u.id}`)}>
              <span className={`employee-status-dot status-dot-${(u.todayStatus || 'absent').toLowerCase()}`} title={u.todayStatus}>
                {STATUS_ICON[u.todayStatus] || '●'}
              </span>
              <span className="avatar-circle large">{initials(u.name)}</span>
              <span className="employee-card-name">{u.name}</span>
              <span className="employee-card-role">{u.jobPosition || u.role}</span>
              <span className="employee-card-dept">{u.department}</span>
            </button>
          ))}
          {filtered.length === 0 && <p className="muted">No employees match your search.</p>}
        </div>
      )}

      {showAdd && (
        <Modal title="Add New Employee" onClose={() => setShowAdd(false)}>
          {createdInfo ? (
            <div className="created-info">
              <p><strong>{createdInfo.name}</strong>'s account has been created.</p>
              <div className="credential-box">
                <div><span className="muted">Login ID</span><strong>{createdInfo.code}</strong></div>
                <div><span className="muted">Temporary Password</span><strong>{createdInfo.password}</strong></div>
              </div>
              <p className="field-hint">Share these credentials with the employee. They'll be asked to set a new password on first login.</p>
              <button className="btn btn-primary btn-block" onClick={() => setShowAdd(false)}>Done</button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="stacked-form">
              {error && <div className="alert alert-error">{error}</div>}
              <label>Full Name
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <label>Email
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
              <div className="form-row">
                <label>Department
                  <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                </label>
                <label>Job Position
                  <input value={form.jobPosition} onChange={(e) => setForm({ ...form, jobPosition: e.target.value })} />
                </label>
              </div>
              <div className="form-row">
                <label>Role
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="employee">Employee</option>
                    <option value="admin">HR / Admin</option>
                  </select>
                </label>
                <label>Date of Joining
                  <input type="date" value={form.dateOfJoining} onChange={(e) => setForm({ ...form, dateOfJoining: e.target.value })} />
                </label>
              </div>
              <button className="btn btn-primary btn-block" type="submit" disabled={creating}>
                {creating ? 'Creating...' : 'Create Employee'}
              </button>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
