import React from "react";

export default function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div
      className="card-padded"
      style={{
        backgroundColor: "rgba(220, 38, 38, 0.08)",
        border: "1px solid rgba(220, 38, 38, 0.3)",
        borderRadius: "var(--radius)",
        color: "var(--color-danger)",
        fontSize: 14,
        marginBottom: 16,
      }}
    >
      {message}
    </div>
  );
}
