import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWorkflowById,
  submitApprovalAction,
  archiveWorkflow,
  clearSelectedWorkflow,
} from "../features/workflows/workflowSlice";
import { StatusBadge, PriorityBadge } from "../components/common/StatusBadge";
import Loader from "../components/common/Loader";
import ErrorBanner from "../components/common/ErrorBanner";
import axiosClient from "../api/axiosClient";

export default function WorkflowDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selected, status, error } = useSelector((state) => state.workflows);
  const { user } = useSelector((state) => state.auth);

  const [remarks, setRemarks] = useState("");
  const [actionError, setActionError] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiBottlenecks, setAiBottlenecks] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchWorkflowById(id));
    return () => dispatch(clearSelectedWorkflow());
  }, [dispatch, id]);

  if (status === "loading" && !selected) return <Loader label="Loading workflow..." />;
  if (!selected) return null;

  const currentStep = selected.approvalSteps[selected.currentStage];
  const isMyTurn = currentStep && (currentStep.approverId === user.id || user.role === "ADMIN");
  const isOwnerOrAdmin = selected.ownerId === user.id || user.role === "ADMIN";
  const isClosed = ["COMPLETED", "REJECTED", "ARCHIVED"].includes(selected.status);

  const handleAction = async (action) => {
    setActionError(null);
    try {
      await dispatch(submitApprovalAction({ id: selected.id, action, remarks })).unwrap();
      setRemarks("");
    } catch (err) {
      setActionError(typeof err === "string" ? err : "Action failed");
    }
  };

  const handleArchive = async () => {
    await dispatch(archiveWorkflow(selected.id));
    navigate("/workflows");
  };

  const runAi = async (endpoint, setter) => {
    setAiLoading(true);
    try {
      const { data } = await axiosClient.get(`/ai/workflows/${selected.id}/${endpoint}`);
      setter(data.result);
    } catch (err) {
      setter("AI insight unavailable right now.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div>
      <button className="btn btn-secondary btn-sm mb-16" onClick={() => navigate("/workflows")}>
        ← Back to workflows
      </button>

      <div className="card card-padded mb-16">
        <div className="flex-between">
          <div>
            <h1 style={{ fontSize: 20, margin: 0 }}>{selected.title}</h1>
            <p className="text-muted" style={{ marginTop: 6 }}>
              {selected.departmentName} • Owned by {selected.ownerName}
            </p>
          </div>
          <div className="flex gap-8">
            <PriorityBadge priority={selected.priority} />
            <StatusBadge status={selected.status} />
          </div>
        </div>
        <p style={{ marginTop: 12 }}>{selected.description || "No description provided."}</p>
        <div className="flex gap-16 text-muted" style={{ fontSize: 13 }}>
          <span>Due: {selected.dueDate || "—"}</span>
          <span>Stage {selected.currentStage + 1} of {selected.approvalSteps.length}</span>
        </div>

        {isOwnerOrAdmin && !isClosed && (
          <div className="mt-16">
            <button className="btn btn-secondary btn-sm" onClick={handleArchive}>
              Archive workflow
            </button>
          </div>
        )}
      </div>

      <div className="card card-padded mb-16">
        <h3 style={{ marginTop: 0, fontSize: 15 }}>Approval chain</h3>
        <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {selected.approvalSteps.map((step, idx) => (
            <li
              key={step.id}
              className="flex-between"
              style={{
                padding: "10px 0",
                borderBottom:
                  idx < selected.approvalSteps.length - 1 ? "1px solid var(--color-border)" : "none",
              }}
            >
              <div>
                <strong>
                  Stage {idx + 1}: {step.approverName}
                </strong>
                {step.remarks && <div className="text-muted" style={{ fontSize: 13 }}>"{step.remarks}"</div>}
              </div>
              <StatusBadge status={step.status === "PENDING" && idx === selected.currentStage ? "IN_PROGRESS" : step.status} />
            </li>
          ))}
        </ol>

        {isMyTurn && !isClosed && selected.status !== "REJECTED" && (
          <div className="mt-16">
            <ErrorBanner message={actionError} />
            <label className="form-label">Remarks (optional)</label>
            <textarea
              className="form-control mb-16"
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add context for your decision..."
            />
            <div className="flex gap-12">
              <button className="btn btn-primary" onClick={() => handleAction("APPROVE")}>
                Approve
              </button>
              <button className="btn btn-secondary" onClick={() => handleAction("SEND_BACK")}>
                Send back
              </button>
              <button className="btn btn-danger" onClick={() => handleAction("REJECT")}>
                Reject
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="card card-padded">
        <h3 style={{ marginTop: 0, fontSize: 15 }}>✨ AI Insights</h3>
        <div className="flex gap-12 mb-16">
          <button className="btn btn-secondary btn-sm" disabled={aiLoading} onClick={() => runAi("summary", setAiSummary)}>
            Generate summary
          </button>
          <button
            className="btn btn-secondary btn-sm"
            disabled={aiLoading}
            onClick={() => runAi("predict-bottlenecks", setAiBottlenecks)}
          >
            Predict bottlenecks
          </button>
        </div>
        {aiSummary && (
          <p className="text-muted" style={{ fontSize: 14 }}>
            <strong>Summary:</strong> {aiSummary}
          </p>
        )}
        {aiBottlenecks && (
          <p className="text-muted" style={{ fontSize: 14 }}>
            <strong>Bottleneck check:</strong> {aiBottlenecks}
          </p>
        )}
      </div>

      <ErrorBanner message={error} />
    </div>
  );
}
