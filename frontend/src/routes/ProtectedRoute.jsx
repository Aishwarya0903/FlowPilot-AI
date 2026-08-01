import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

/**
 * Wraps a route element and redirects unauthenticated users to /login.
 * Optionally restrict by role: <ProtectedRoute roles={["ADMIN","MANAGER"]}>
 */
export default function ProtectedRoute({ children, roles }) {
  const { user, token } = useSelector((state) => state.auth);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
