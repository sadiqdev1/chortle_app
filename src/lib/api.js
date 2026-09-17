import axios from "axios";
import { storage } from "./storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  console.warn(
    "EXPO_PUBLIC_API_URL is not configured. Add it to your .env file."
  );
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 8000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ------------------------------------------------------------
// Request interceptor
// Automatically attaches the stored authentication token.
// ------------------------------------------------------------

api.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ------------------------------------------------------------
// Response interceptor
// Handles expired/invalid authentication.
// ------------------------------------------------------------

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    if (error.response?.status === 401) {
      await storage.clearAuth();
    }

    return Promise.reject(error);
  }
);

export function getApiUrl() {
  return API_URL;
}

export default api;
