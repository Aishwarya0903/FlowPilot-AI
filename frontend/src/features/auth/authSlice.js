import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";

const storedUser = localStorage.getItem("fp_user");

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: localStorage.getItem("fp_access_token") || null,
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post("/auth/login", credentials);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post("/auth/register", payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Registration failed");
    }
  }
);

const persistSession = (data) => {
  localStorage.setItem("fp_access_token", data.accessToken);
  localStorage.setItem(
    "fp_user",
    JSON.stringify({
      id: data.userId,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
    })
  );
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("fp_access_token");
      localStorage.removeItem("fp_user");
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        persistSession(action.payload);
        state.token = action.payload.accessToken;
        state.user = {
          id: action.payload.userId,
          fullName: action.payload.fullName,
          email: action.payload.email,
          role: action.payload.role,
        };
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "succeeded";
        persistSession(action.payload);
        state.token = action.payload.accessToken;
        state.user = {
          id: action.payload.userId,
          fullName: action.payload.fullName,
          email: action.payload.email,
          role: action.payload.role,
        };
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
