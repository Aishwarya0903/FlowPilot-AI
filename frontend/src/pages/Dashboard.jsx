import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { fetchDashboard } from "../features/dashboard/dashboardSlice";
import Loader from "../components/common/Loader";
import ErrorBanner from "../components/common/ErrorBanner";

const COLORS = ["#0b5fff", "#16a34a", "#d97706", "#dc2626", "#6b7280", "#9333ea"];

export default function Dashboard() {
  const dispatch = useDispatch();
  const { summary, status, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  if (status === "loading" && !summary) return <Loader label="Loading dashboard..." />;

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Dashboard</h1>
      <p className="text-muted mb-16">Overview of workflow activity across your organization</p>

      <ErrorBanner message={error} />

      {summary && (
        <>
          <div className="stat-grid mb-16">
            <div className="card stat-card">
              <div className="stat-label">Total workflows</div>
              <div className="stat-value">{summary.totalWorkflows}</div>
            </div>
            <div className="card stat-card">
              <div className="stat-label">Pending</div>
              <div className="stat-value" style={{ color: "var(--color-primary)" }}>
                {summary.pendingWorkflows}
              </div>
            </div>
            <div className="card stat-card">
              <div className="stat-label">Completed</div>
              <div className="stat-value" style={{ color: "var(--color-success)" }}>
                {summary.completedWorkflows}
              </div>
            </div>
            <div className="card stat-card">
              <div className="stat-label">Approval rate</div>
              <div className="stat-value">{summary.approvalRate}%</div>
            </div>
          </div>

          <div className="flex gap-16" style={{ flexWrap: "wrap" }}>
            <div className="card card-padded" style={{ flex: "1 1 320px" }}>
              <h3 style={{ marginTop: 0, fontSize: 15 }}>Workflows by status</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={Object.entries(summary.workflowsByStatus).map(([name, value]) => ({ name, value }))}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label
                  >
                    {Object.keys(summary.workflowsByStatus).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card card-padded" style={{ flex: "1 1 320px" }}>
              <h3 style={{ marginTop: 0, fontSize: 15 }}>Workflows by department</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={Object.entries(summary.workflowsByDepartment).map(([name, value]) => ({ name, value }))}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0b5fff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card card-padded mt-16">
            <h3 style={{ marginTop: 0, fontSize: 15 }}>Recent activity</h3>
            {summary.recentActivity.length === 0 && <p className="text-muted">No recent activity yet.</p>}
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {summary.recentActivity.map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    padding: "10px 0",
                    borderBottom: idx < summary.recentActivity.length - 1 ? "1px solid var(--color-border)" : "none",
                    fontSize: 14,
                  }}
                >
                  <strong>{item.actorName}</strong>{" "}
                  <span className="text-muted">{item.action.replaceAll("_", " ").toLowerCase()}</span>
                  {item.details && <span> — {item.details}</span>}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
