import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../features/auth/authSlice";
import ErrorBanner from "../components/common/ErrorBanner";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    departmentId: "",
  });

  useEffect(() => {
    // Department list has no dedicated public endpoint pre-auth in this build,
    // so we default to department 1 (Engineering) if none is selected —
    // an admin can reassign departments later from the Users view.
    setDepartments([
      { id: 1, name: "Engineering" },
      { id: 2, name: "Finance" },
      { id: 3, name: "Human Resources" },
      { id: 4, name: "Sales" },
    ]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, departmentId: form.departmentId ? Number(form.departmentId) : null };
    const result = await dispatch(register(payload));
    if (register.fulfilled.match(result)) {
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
      <div className="card card-padded" style={{ width: 420 }}>
        <h2 style={{ marginTop: 0, color: "var(--color-primary)" }}>Create account</h2>
        <p className="text-muted" style={{ marginTop: -8, marginBottom: 24, fontSize: 14 }}>
          Join your organization's FlowPilot AI workspace
        </p>

        <ErrorBanner message={error} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input
              className="form-control"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password (min 8 characters)</label>
            <input
              type="password"
              className="form-control"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="flex gap-12">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Role</label>
              <select
                className="form-control"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Department</label>
              <select
                className="form-control"
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              >
                <option value="">None</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={status === "loading"}>
            {status === "loading" ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 13 }} className="text-muted">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
