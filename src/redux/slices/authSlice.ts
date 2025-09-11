// @/redux/slices/authSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import api, { setAuthToken, clearAuthToken } from "@/utils/api"; // Import the functions
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
    setUser(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      
      // Set token in API utility
      setAuthToken(action.payload.token);
      
      // Store in localStorage if needed
      localStorage.setItem("token", action.payload.token);
    },
    clearError(state) {
      state.error = null;
    },
    initializeAuth(state) {
      // Check for stored token on app start
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        state.token = storedToken;
        state.isAuthenticated = true;
        setAuthToken(storedToken);
      }
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
        
        // Set token in API utility
        setAuthToken(action.payload.token);
        
        // Store in localStorage
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Login failed";
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        
        // Clear token from API utility
        clearAuthToken();
        
        // Remove from localStorage
        localStorage.removeItem("token");
      });
  },
});

export const { setUser, clearError, initializeAuth } = authSlice.actions;

export default authSlice.reducer;