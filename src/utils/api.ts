import axios, { AxiosHeaders } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_URL,
  timeout: 30000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (!config.headers) {
      config.headers = new AxiosHeaders();
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
