// @/utils/api.ts
import axios, { AxiosHeaders } from "axios";
import type { InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_URL,
  timeout: 30000,
});

// Create a variable to store the token
let authToken: string | null = null;

// Function to set the token from outside
export const setAuthToken = (token: string | null) => {
  authToken = token;
};

// Function to get the token
export const getAuthToken = (): string | null => {
  return authToken;
};

// Function to clear the token
export const clearAuthToken = () => {
  authToken = null;
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }

    // Use the stored token
    if (authToken) {
      config.headers.set("Authorization", `Bearer ${authToken}`);
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers.set("Content-Type", "application/json");
    }
    
    return config;
  },
  (error) => {
    console.error("API Request Error:", {
      url: error.config?.url,
      method: error.config?.method,
      data: error.config?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.warn("Authentication failed - token may be expired");
      // Clear the token on auth errors
      clearAuthToken();
    }
    
    console.error("API Response Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export default api;