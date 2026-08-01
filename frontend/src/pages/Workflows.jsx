import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchWorkflows, createWorkflow } from "../features/workflows/workflowSlice";
import { StatusBadge, PriorityBadge } from "../components/common/StatusBadge";
import Pagination from "../components/common/Pagination";
import Loader from "../components/common/Loader";
import ErrorBanner from "../components/common/ErrorBanner";
import axiosClient from "../api/axiosClient";

const STATUS_OPTIONS = ["IN_PROGRESS", "COMPLETED", "REJECTED", "SENT_BACK", "ARCHIVED"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function Workflows() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, pageNumber, totalPages, status, error } = useSelector((state) => state.workflows);

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sort, setSort] = useState("createdAt,desc");
  const [showCreate, setShowCreate] = useState(false);

  const loadPage = (page = 0) => {
    dispatch(
      fetchWorkflows({
        page,
        size: 10,
        sort,
        keyword: keyword || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      })
    );
  };

  useEffect(() => {
    loadPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, priorityFilter, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadPage(0);
  };

  return (
    <div>
      <div className="flex-between mb-16">
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 4 }}>Workflows</h1>
          <p className="text-muted" style={{ margin: 0 }}>
            Create, track, and approve business workflows
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + New Workflow
        </button>
      </div>

      <ErrorBanner message={error} />

      <div className="card card-padded mb-16">
        <form onSubmit={handleSearch} className="flex gap-12" style={{ flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "2 1 220px" }}>
            <label className="form-label">Search</label>
            <input
              className="form-control"
              placeholder="Search by title..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div style={{ flex: "1 1 160px" }}>
            <label className="form-label">Status</label>
            <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: "1 1 160px" }}>
            <label className="form-label">Priority</label>
            <select className="form-control" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="">All</option>
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: "1 1 160px" }}>
            <label className="form-label">Sort by</label>
            <select className="form-control" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="createdAt,desc">Newest first</option>
              <option value="createdAt,asc">Oldest first</option>
              <option value="dueDate,asc">Due date</option>
              <option value="priority,desc">Priority</option>
            </select>
          </div>
          <button type="submit" className="btn btn-secondary">
            Apply
          </button>
        </form>
      </div>

      {status === "loading" ? (
        <Loader />
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Department</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Stage</th>
                <th>Due date</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-muted" style={{ textAlign: "center", padding: 30 }}>
                    No workflows found. Create one to get started.
                  </td>
                </tr>
              )}
              {items.map((w) => (
                <tr key={w.id} style={{ cursor: "pointer" }} onClick={() => navigate(`/workflows/${w.id}`)}>
                  <td style={{ fontWeight: 600 }}>{w.title}</td>
                  <td>{w.departmentName}</td>
                  <td>
                    <PriorityBadge priority={w.priority} />
                  </td>
                  <td>
                    <StatusBadge status={w.status} />
                  </td>
                  <td>
                    {w.currentStage + 1} / {w.approvalSteps.length}
                  </td>
                  <td>{w.dueDate || "—"}</td>
                  <td>{w.ownerName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination pageNumber={pageNumber} totalPages={totalPages} onPageChange={loadPage} />

      {showCreate && <CreateWorkflowModal onClose={() => setShowCreate(false)} onCreated={() => loadPage(0)} />}
    </div>
  );
}

function CreateWorkflowModal({ onClose, onCreated }) {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    departmentId: "1",
    priority: "MEDIUM",
    dueDate: "",
    approverIds: [],
  });

  useEffect(() => {
    axiosClient.get("/users").then((res) => setUsers(res.data)).catch(() => setUsers([]));
  }, []);

  const toggleApprover = (id) => {
    setForm((f) => ({
      ...f,
      approverIds: f.approverIds.includes(id) ? f.approverIds.filter((x) => x !== id) : [...f.approverIds, id],
    }));
  };

  const handleAiSuggest = async () => {
    try {
      const dept = { "1": "Engineering", "2": "Finance", "3": "Human Resources", "4": "Sales" }[form.departmentId];
      const { data } = await axiosClient.post("/ai/suggest-steps", {
        title: form.title || "Untitled workflow",
        description: form.description,
        department: dept,
      });
      setAiSuggestions(data);
    } catch (err) {
      setAiSuggestions([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.approverIds.length === 0) {
      setFormError("Select at least one approver.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await dispatch(
        createWorkflow({
          ...form,
          departmentId: Number(form.departmentId),
          dueDate: form.dueDate || null,
        })
      ).unwrap();
      onCreated();
      onClose();
    } catch (err) {
      setFormError(typeof err === "string" ? err : "Failed to create workflow");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        className="card card-padded"
        style={{ width: 520, maxHeight: "88vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0 }}>New Workflow</h3>
        <ErrorBanner message={formError} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              className="form-control"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex gap-12">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Department</label>
              <select
                className="form-control"
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              >
                <option value="1">Engineering</option>
                <option value="2">Finance</option>
                <option value="3">Human Resources</option>
                <option value="4">Sales</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Priority</label>
              <select
                className="form-control"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Due date</label>
            <input
              type="date"
              className="form-control"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>

          <div className="form-group">
            <div className="flex-between">
              <label className="form-label" style={{ marginBottom: 0 }}>
                Approvers (in order)
              </label>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleAiSuggest}>
                ✨ AI suggest steps
              </button>
            </div>
            <div
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius)",
                padding: 10,
                maxHeight: 140,
                overflowY: "auto",
                marginTop: 6,
              }}
            >
              {users.map((u) => (
                <label key={u.id} className="flex gap-8" style={{ padding: "4px 0", fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={form.approverIds.includes(u.id)}
                    onChange={() => toggleApprover(u.id)}
                  />
                  {u.fullName} <span className="text-muted">({u.role})</span>
                </label>
              ))}
            </div>
            {aiSuggestions.length > 0 && (
              <div className="text-muted mt-16" style={{ fontSize: 13 }}>
                AI suggested stages: {aiSuggestions.join(" → ")}
              </div>
            )}
          </div>

          <div className="flex gap-12 mt-16">
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? "Creating..." : "Create Workflow"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
