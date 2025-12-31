import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1/";
const API_BASE_URL = "https://backend.apptv-cms.com/api/v1/";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token management without Redux dependency
let currentToken: string | null = null;
let refreshTokenCallback: (() => Promise<string>) | null = null;
let logoutCallback: (() => void) | null = null;

// Set callbacks from outside (will be set in store configuration)
export const setTokenRefreshCallback = (callback: () => Promise<string>) => {
  refreshTokenCallback = callback;
};

export const setLogoutCallback = (callback: () => void) => {
  logoutCallback = callback;
};

export const setAuthToken = (token: string | null) => {
  currentToken = token;
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export const clearAuthToken = () => {
  currentToken = null;
  delete api.defaults.headers.common["Authorization"];
};

// Track if we're currently refreshing
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

// Process queued requests after token refresh
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (currentToken && config.headers) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh for auth endpoints
      if (
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/refresh-token") ||
        originalRequest.url?.includes("/auth/register")
      ) {
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use the callback for token refresh
        if (refreshTokenCallback) {
          const newToken = await refreshTokenCallback();
          
          // Update the failed request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          // Process queued requests
          processQueue(null, newToken);

          // Retry the original request
          return api(originalRequest);
        } else {
          throw new Error("Token refresh callback not set");
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        processQueue(refreshError as Error, null);
        if (logoutCallback) {
          logoutCallback();
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;