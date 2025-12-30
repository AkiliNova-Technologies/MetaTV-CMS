// @/hooks/useReduxAuth.ts
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  login,
  logout,
  logoutAllDevices,
  refreshAccessToken,
  getCurrentUser,
  setTokens,
  clearError,
} from "@/redux/slices/authSlice";
import type { User } from "@/types/user";
import { useEffect, useCallback } from "react";

export function useReduxAuth() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state?.auth ?? {});

  const {
    user = null,
    accessToken = null,
    refreshToken = null,
    isAuthenticated = false,
    loading = false,
    error = null,
    refreshing = false,
  } = auth;

  /**
   * Sign in user
   */
  const signin = useCallback(
    async (email: string, password: string) => {
      const result = await dispatch(login({ email, password }));
      return result;
    },
    [dispatch]
  );

  /**
   * Sign out user
   */
  const signout = useCallback(async () => {
    const result = await dispatch(logout());
    return result;
  }, [dispatch]);

  /**
   * Sign out from all devices
   */
  const signoutAllDevices = useCallback(async () => {
    const result = await dispatch(logoutAllDevices());
    return result;
  }, [dispatch]);

  /**
   * Manually refresh access token
   */
  const refreshTokens = useCallback(async () => {
    const result = await dispatch(refreshAccessToken());
    return result;
  }, [dispatch]);

  /**
   * Get current user data
   */
  const fetchCurrentUser = useCallback(async () => {
    const result = await dispatch(getCurrentUser());
    return result;
  }, [dispatch]);

  /**
   * Set user data and tokens (useful for external auth flows)
   */
  const setUserData = useCallback(
    (userData: { user: User; accessToken: string; refreshToken: string }) => {
      dispatch(setTokens(userData));
    },
    [dispatch]
  );

  /**
   * Clear any auth errors
   */
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  /**
   * Automatically fetch user data on mount if authenticated
   */
  useEffect(() => {
    if (isAuthenticated && !user && accessToken) {
      dispatch(getCurrentUser());
    }
  }, [isAuthenticated, user, accessToken, dispatch]);

  /**
   * Check token expiration and refresh if needed
   * This runs periodically to ensure tokens stay fresh
   */
  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    // Check token expiration every 5 minutes
    const checkInterval = setInterval(() => {
      const tokenPayload = parseJwt(accessToken);
      if (tokenPayload && tokenPayload.exp) {
        const expiresAt = tokenPayload.exp * 1000;
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;

        // Refresh if token expires in less than 5 minutes
        if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
          dispatch(refreshAccessToken());
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(checkInterval);
  }, [isAuthenticated, accessToken, dispatch]);

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    loading,
    error,
    refreshing,
    dispatch,
    signin,
    signout,
    signoutAllDevices,
    refreshTokens, // Changed from refreshToken to refreshTokens
    fetchCurrentUser,
    setUserData,
    clearAuthError,
  };
}

/**
 * Helper function to parse JWT token
 */
function parseJwt(token: string): { exp?: number } | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to parse JWT:", error);
    return null;
  }
}