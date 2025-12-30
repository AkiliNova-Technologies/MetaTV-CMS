// @/redux/slices/authSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import api, { setAuthToken, clearAuthToken } from "@/utils/api";
import type { User } from "@/types/user";

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  refreshing: false,
};

// Login thunk
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// Refresh token thunk
export const refreshAccessToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { getState, rejectWithValue }) => {
    try {
      // Don't import RootState, type it inline
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken;

      if (!refreshToken) {
        return rejectWithValue("No refresh token available");
      }

      const response = await api.post("/auth/refresh-token", { refreshToken });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Token refresh failed");
    }
  }
);

// Logout thunk
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken;

      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
      return true;
    } catch (error: any) {
      // Even if logout fails, clear local state
      return true;
    }
  }
);

// Logout from all devices thunk
export const logoutAllDevices = createAsyncThunk(
  "auth/logoutAllDevices",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/auth/logout-all");
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

// Get current user thunk
export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/me");
      return response.data.data.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to get user");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setTokens(
      state,
      action: PayloadAction<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.error = null;

      // Set token in API utility
      setAuthToken(action.payload.accessToken);
    },

    clearError(state) {
      state.error = null;
    },

    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    setRefreshing(state, action: PayloadAction<boolean>) {
      state.refreshing = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;

        // Set token in API utility
        setAuthToken(action.payload.accessToken);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

      // Refresh token cases
      .addCase(refreshAccessToken.pending, (state) => {
        state.refreshing = true;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.refreshing = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;

        // Set token in API utility
        setAuthToken(action.payload.accessToken);
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.refreshing = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;

        // Clear token from API utility
        clearAuthToken();
      })

      // Logout cases
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;

        // Clear token from API utility
        clearAuthToken();
      })

      // Logout all devices cases
      .addCase(logoutAllDevices.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;

        // Clear token from API utility
        clearAuthToken();
      })

      // Get current user cases
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        // If getting current user fails, tokens might be invalid
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;

        // Clear token from API utility
        clearAuthToken();
      });
  },
});

export const {
  setTokens,
  clearError,
  updateUser,
  setRefreshing,
} = authSlice.actions;

export default authSlice.reducer;