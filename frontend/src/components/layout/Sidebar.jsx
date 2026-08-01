import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/workflows", label: "Workflows", icon: "🗂️" },
  { to: "/notifications", label: "Notifications", icon: "🔔" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

export default function Sidebar() {
  const collapsed = useSelector((state) => state.ui.sidebarCollapsed);

  return (
    <aside
      className="sidebar"
      style={{
        width: collapsed ? "var(--sidebar-width-collapsed)" : "var(--sidebar-width)",
        backgroundColor: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
        transition: "width 0.15s ease",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          height: "var(--navbar-height)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          fontWeight: 700,
          fontSize: collapsed ? 18 : 16,
          borderBottom: "1px solid var(--color-border)",
          color: "var(--color-primary)",
        }}
      >
        {collapsed ? "FP" : "FlowPilot AI"}
      </div>
      <nav style={{ padding: "12px 8px" }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: "var(--radius)",
              marginBottom: 4,
              fontSize: 14,
              fontWeight: 500,
              color: isActive ? "var(--color-primary)" : "var(--color-text)",
              backgroundColor: isActive ? "rgba(11,95,255,0.1)" : "transparent",
            })}
          >
            <span>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
