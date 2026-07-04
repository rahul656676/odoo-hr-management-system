// src/pages/Dashboard.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

const STATUS_ICON = {
  Present: "●",
  OnLeave: "●",
  Absent: "●",
  "Half-day": "●",
};

function EmployeeGrid() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/users")
      .then(({ data }) => setUsers(data.users))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const counts = users.reduce((acc, u) => {
    acc[u.todayStatus] =
      (acc[u.todayStatus] || 0) + 1;

    return acc;
  }, {});

  return (
    <>
      {/* STATS */}
      <div className="stat-row">
        <div className="stat-card">
          <span className="stat-value">
            {users.length}
          </span>

          <span className="stat-label">
            Total Employees
          </span>
        </div>

        <div className="stat-card accent-green">
          <span className="stat-value">
            {counts.Present || 0}
          </span>

          <span className="stat-label">
            Present Today
          </span>
        </div>

        <div className="stat-card accent-amber">
          <span className="stat-value">
            {counts.Absent || 0}
          </span>

          <span className="stat-label">
            Absent Today
          </span>
        </div>

        <div className="stat-card accent-blue">
          <span className="stat-value">
            {counts.OnLeave || 0}
          </span>

          <span className="stat-label">
            On Leave
          </span>
        </div>
      </div>

      {/* EMPLOYEE SECTION */}
      <div className="section-header">
        <h2>Employees</h2>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {loading ? (
        <p className="muted">
          Loading employees...
        </p>
      ) : (
        <div className="employee-card-grid">
          {users.map((u) => (
            <button
              className="employee-card"
              key={u.id}
              onClick={() =>
                navigate(`/employees/${u.id}`)
              }
            >
              <span
                className={`employee-status-dot status-dot-${(
                  u.todayStatus || "absent"
                ).toLowerCase()}`}
                title={u.todayStatus}
              >
                {STATUS_ICON[u.todayStatus] || "●"}
              </span>

              <span className="avatar-circle large">
                {u.profilePic ? (
                  <img
                    src={u.profilePic}
                    alt={u.name}
                  />
                ) : (
                  initials(u.name)
                )}
              </span>

              <span className="employee-card-name">
                {u.name}
              </span>

              <span className="employee-card-role">
                {u.jobPosition || u.role}
              </span>

              <span className="employee-card-dept">
                {u.department}
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function EmployeeQuickAccess() {
  const { user } = useAuth();

  return (
    <>
      <div className="welcome-banner">
        <div>
          <h2>
            Welcome back,{" "}
            {user?.name?.split(" ")[0]}
          </h2>

          <p className="muted">
            Here is what is happening with your
            workday.
          </p>
        </div>
      </div>

      <div className="section-header">
        <h2>Quick Access</h2>
      </div>

      <div className="quick-card-grid">
        <button className="quick-card">
          <span>Profile</span>
        </button>

        <button className="quick-card">
          <span>Attendance</span>
        </button>

        <button className="quick-card">
          <span>Leave Requests</span>
        </button>

        <button className="quick-card">
          <span>Settings</span>
        </button>
      </div>
    </>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div
      className="page"
      style={{
        background: "#e5e7eb", // LIGHT GREY
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      {user?.role === "admin" ? (
        <EmployeeGrid />
      ) : (
        <EmployeeQuickAccess />
      )}
    </div>
  );
}