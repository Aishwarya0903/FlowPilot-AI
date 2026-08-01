import React from "react";

export default function Loader({ label = "Loading..." }) {
  return (
    <div className="flex" style={{ alignItems: "center", justifyContent: "center", padding: 40, gap: 10 }}>
      <div
        style={{
          width: 18,
          height: 18,
          border: "2px solid var(--color-border)",
          borderTopColor: "var(--color-primary)",
          borderRadius: "50%",
          animation: "fp-spin 0.7s linear infinite",
        }}
      />
      <span className="text-muted">{label}</span>
      <style>{`@keyframes fp-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
