import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toggleTheme, toggleSidebar } from "../../features/uiSlice";
import { logout } from "../../features/auth/authSlice";
import { fetchUnreadCount } from "../../features/notifications/notificationSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchUnreadCount());
    const interval = setInterval(() => dispatch(fetchUnreadCount()), 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header
      style={{
        height: "var(--navbar-height)",
        borderBottom: "1px solid var(--color-border)",
        backgroundColor: "var(--color-surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <button
        className="btn btn-secondary btn-sm"
        onClick={() => dispatch(toggleSidebar())}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      <div className="flex gap-16" style={{ alignItems: "center" }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate("/notifications")}
          aria-label="Notifications"
        >
          🔔 {unreadCount > 0 && <span className="badge badge-red">{unreadCount}</span>}
        </button>

        <button className="btn btn-secondary btn-sm" onClick={() => dispatch(toggleTheme())}>
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>

        <div className="flex gap-8" style={{ alignItems: "center" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "var(--color-primary)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {user?.fullName?.charAt(0) || "U"}
          </div>
          <div style={{ fontSize: 13 }}>
            <div style={{ fontWeight: 600 }}>{user?.fullName}</div>
            <div className="text-muted">{user?.role}</div>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
