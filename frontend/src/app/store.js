import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import workflowReducer from "../features/workflows/workflowSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";
import notificationReducer from "../features/notifications/notificationSlice";
import uiReducer from "../features/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workflows: workflowReducer,
    dashboard: dashboardReducer,
    notifications: notificationReducer,
    ui: uiReducer,
  },
});

export default store;
