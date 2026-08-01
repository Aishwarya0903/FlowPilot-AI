import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../features/auth/authSlice";
import ErrorBanner from "../components/common/ErrorBanner";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) {
      navigate("/dashboard");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--color-bg)",
      }}
    >
      <div className="card card-padded" style={{ width: 380 }}>
        <h2 style={{ marginTop: 0, color: "var(--color-primary)" }}>FlowPilot AI</h2>
        <p className="text-muted" style={{ marginTop: -8, marginBottom: 24, fontSize: 14 }}>
          Sign in to your workspace
        </p>

        <ErrorBanner message={error} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@company.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={status === "loading"}>
            {status === "loading" ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 13 }} className="text-muted">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>

        <div className="mt-16 text-muted" style={{ fontSize: 12 }}>
          Demo: admin@flowpilot.ai / manager@flowpilot.ai / employee@flowpilot.ai — password: Password123!
        </div>
      </div>
    </div>
  );
}
