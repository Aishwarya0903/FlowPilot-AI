import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/notifications", { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load notifications");
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/unreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/notifications/unread-count");
      return data.unreadCount;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load unread count");
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.patch(`/notifications/${id}/read`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update notification");
    }
  }
);

const initialState = {
  items: [],
  unreadCount: 0,
  status: "idle",
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload.content;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const n = state.items.find((i) => i.id === action.payload);
        if (n) n.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      });
  },
});

export default notificationSlice.reducer;
