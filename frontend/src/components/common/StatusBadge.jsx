import React from "react";

const STATUS_STYLES = {
  DRAFT: "badge-gray",
  IN_PROGRESS: "badge-blue",
  APPROVED: "badge-green",
  COMPLETED: "badge-green",
  REJECTED: "badge-red",
  SENT_BACK: "badge-amber",
  ARCHIVED: "badge-gray",
};

const PRIORITY_STYLES = {
  LOW: "badge-gray",
  MEDIUM: "badge-blue",
  HIGH: "badge-amber",
  CRITICAL: "badge-red",
};

export function StatusBadge({ status }) {
  return <span className={`badge ${STATUS_STYLES[status] || "badge-gray"}`}>{status?.replace("_", " ").toLowerCase()}</span>;
}

export function PriorityBadge({ priority }) {
  return <span className={`badge ${PRIORITY_STYLES[priority] || "badge-gray"}`}>{priority?.toLowerCase()}</span>;
}
