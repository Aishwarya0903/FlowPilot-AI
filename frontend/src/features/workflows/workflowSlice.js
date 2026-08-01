import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";

export const fetchWorkflows = createAsyncThunk(
  "workflows/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/workflows", { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load workflows");
    }
  }
);

export const fetchWorkflowById = createAsyncThunk(
  "workflows/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(`/workflows/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load workflow");
    }
  }
);

export const createWorkflow = createAsyncThunk(
  "workflows/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post("/workflows", payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create workflow");
    }
  }
);

export const submitApprovalAction = createAsyncThunk(
  "workflows/approvalAction",
  async ({ id, action, remarks }, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post(`/workflows/${id}/approval-action`, { action, remarks });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to process approval");
    }
  }
);

export const archiveWorkflow = createAsyncThunk(
  "workflows/archive",
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.patch(`/workflows/${id}/archive`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to archive workflow");
    }
  }
);

const initialState = {
  items: [],
  pageNumber: 0,
  pageSize: 10,
  totalElements: 0,
  totalPages: 0,
  selected: null,
  status: "idle",
  error: null,
};

const workflowSlice = createSlice({
  name: "workflows",
  initialState,
  reducers: {
    clearSelectedWorkflow: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkflows.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchWorkflows.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.content;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchWorkflows.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchWorkflowById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(createWorkflow.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(submitApprovalAction.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(archiveWorkflow.fulfilled, (state, action) => {
        state.items = state.items.filter((w) => w.id !== action.payload);
      });
  },
});

export const { clearSelectedWorkflow } = workflowSlice.actions;
export default workflowSlice.reducer;
