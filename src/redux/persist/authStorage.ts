
import storage from 'redux-persist/lib/storage';
import type { AuthState } from "../slices/authSlice";

const AUTH_KEY = "persist:root"; // This matches your redux-persist key

/**
 * Load auth from storage (for manual operations)
 * Note: redux-persist handles this automatically
 */
export const loadAuthFromStorage = async (): Promise<AuthState | null> => {
  try {
    const stored = await storage.getItem(AUTH_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // redux-persist stores it under "auth" key
      if (parsed.auth) {
        return JSON.parse(parsed.auth);
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to load auth state:", error);
    return null;
  }
};

/**
 * Clear auth from storage (for logout)
 * Note: Your logout action should handle this via redux-persist
 */
export const clearAuthFromStorage = async () => {
  try {
    await storage.removeItem(AUTH_KEY);
  } catch (error) {
    console.error("Failed to clear auth state:", error);
  }
};

// Note: You don't need saveAuthToStorage because redux-persist
// automatically saves state changes to localStorage!