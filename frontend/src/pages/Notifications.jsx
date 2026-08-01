import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchNotifications, markNotificationRead } from "../features/notifications/notificationSlice";
import Loader from "../components/common/Loader";

const TYPE_ICON = {
  WORKFLOW_ASSIGNED: "📋",
  APPROVAL_REQUIRED: "✅",
  WORKFLOW_APPROVED: "🎉",
  WORKFLOW_REJECTED: "❌",
  WORKFLOW_SENT_BACK: "↩️",
  COMMENT_ADDED: "💬",
  WORKFLOW_DUE_SOON: "⏰",
};

export default function Notifications() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, status } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications({ page: 0, size: 20 }));
  }, [dispatch]);

  const handleClick = (n) => {
    if (!n.isRead) dispatch(markNotificationRead(n.id));
    if (n.relatedWorkflowId) navigate(`/workflows/${n.relatedWorkflowId}`);
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Notifications</h1>
      <p className="text-muted mb-16">Stay on top of approvals and workflow updates</p>

      {status === "loading" ? (
        <Loader />
      ) : (
        <div className="card">
          {items.length === 0 && (
            <div className="card-padded text-muted" style={{ textAlign: "center" }}>
              You're all caught up.
            </div>
          )}
          {items.map((n, idx) => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className="flex gap-12"
              style={{
                padding: "14px 20px",
                borderBottom: idx < items.length - 1 ? "1px solid var(--color-border)" : "none",
                cursor: "pointer",
                backgroundColor: n.isRead ? "transparent" : "rgba(11,95,255,0.05)",
              }}
            >
              <div style={{ fontSize: 20 }}>{TYPE_ICON[n.type] || "🔔"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: n.isRead ? 400 : 600 }}>{n.message}</div>
                <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              {!n.isRead && (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "var(--color-primary)",
                    alignSelf: "center",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
