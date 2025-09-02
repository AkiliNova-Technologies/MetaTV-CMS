import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import api from "@/utils/api";
import type { User } from "@/types/user";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  return true;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ user: User }>) {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null; // Clear token
        state.isAuthenticated = false;
      });
  },
});

export const { setUser, clearError } = authSlice.actions;

export default authSlice.reducer;
