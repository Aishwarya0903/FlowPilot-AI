import React from "react";
import { useSelector } from "react-redux";

export default function Profile() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Profile</h1>
      <p className="text-muted mb-16">Your account details</p>

      <div className="card card-padded" style={{ maxWidth: 480 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            backgroundColor: "var(--color-primary)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          {user?.fullName?.charAt(0)}
        </div>

        <div className="form-group">
          <div className="form-label">Full name</div>
          <div style={{ fontSize: 15 }}>{user?.fullName}</div>
        </div>
        <div className="form-group">
          <div className="form-label">Email</div>
          <div style={{ fontSize: 15 }}>{user?.email}</div>
        </div>
        <div className="form-group">
          <div className="form-label">Role</div>
          <span className="badge badge-blue">{user?.role}</span>
        </div>
      </div>
    </div>
  );
}
