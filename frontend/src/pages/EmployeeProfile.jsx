// src/pages/EmployeeProfile.jsx

import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function EmployeeProfile({ self = false }) {
  const { id } = useParams();

  const { user: me } = useAuth();

  const targetId = self ? me?.id : Number(id);

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const photoInputRef = useRef(null);

  useEffect(() => {
    if (!targetId) return;

    api
      .get(`/users/${targetId}`)
      .then(({ data }) => {
        setProfile(data.user);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [targetId]);

  if (loading) {
    return (
      <div
        className="page"
        style={{
          background: "#e5e7eb",
          minHeight: "100vh",
          padding: "24px",
        }}
      >
        <p className="muted">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        className="page"
        style={{
          background: "#e5e7eb",
          minHeight: "100vh",
          padding: "24px",
        }}
      >
        <p className="muted">
          Failed to load profile.
        </p>
      </div>
    );
  }

  return (
    <div
      className="page"
      style={{
        background: "#e5e7eb", // LIGHT GREY
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      {/* HEADER */}
      <div
        className="profile-header"
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "24px",
          display: "flex",
          alignItems: "center",
          gap: "20px",
          marginBottom: "24px",
          boxShadow:
            "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        {/* PROFILE IMAGE */}
        <div className="avatar-upload-wrap">
          <span
            className="avatar-circle xlarge"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              overflow: "hidden",
              background: "#4f46e5",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: "700",
            }}
          >
            {profile.profilePic ? (
              <img
                src={profile.profilePic}
                alt={profile.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              initials(profile.name)
            )}
          </span>
        </div>

        {/* INFO */}
        <div>
          <h2
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#111827",
              marginBottom: "6px",
            }}
          >
            {profile.name}
          </h2>

          <p
            style={{
              color: "#6b7280",
              marginBottom: "6px",
            }}
          >
            {profile.jobPosition ||
              profile.role}{" "}
            · {profile.department}
          </p>

          <p
            style={{
              color: "#9ca3af",
              fontSize: "14px",
            }}
          >
            Employee ID:{" "}
            {profile.employeeCode}
          </p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div
          className="alert alert-error"
          style={{
            background: "#fee2e2",
            color: "#dc2626",
            padding: "14px",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* PROFILE DETAILS */}
      <div
        className="card"
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "24px",
          boxShadow:
            "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <h3
          style={{
            fontSize: "24px",
            fontWeight: "700",
            marginBottom: "24px",
            color: "#111827",
          }}
        >
          Employee Details
        </h3>

        <div
          className="detail-grid"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(240px,1fr))",
            gap: "20px",
          }}
        >
          <div>
            <span
              style={{
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Full Name
            </span>

            <h4>{profile.name}</h4>
          </div>

          <div>
            <span
              style={{
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Email
            </span>

            <h4>{profile.email}</h4>
          </div>

          <div>
            <span
              style={{
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Department
            </span>

            <h4>{profile.department}</h4>
          </div>

          <div>
            <span
              style={{
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Position
            </span>

            <h4>
              {profile.jobPosition ||
                profile.role}
            </h4>
          </div>

          <div>
            <span
              style={{
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Phone
            </span>

            <h4>
              {profile.phone || "Not Added"}
            </h4>
          </div>

          <div>
            <span
              style={{
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Location
            </span>

            <h4>
              {profile.location ||
                "Not Added"}
            </h4>
          </div>
        </div>

        {/* ABOUT */}
        <div
          style={{
            marginTop: "30px",
          }}
        >
          <span
            style={{
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            About
          </span>

          <p
            style={{
              marginTop: "10px",
              color: "#374151",
              lineHeight: "1.7",
            }}
          >
            {profile.about ||
              "No description added yet."}
          </p>
        </div>
      </div>
    </div>
  );
}