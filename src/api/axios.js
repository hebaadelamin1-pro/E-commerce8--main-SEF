import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Admin endpoints (POST/PATCH/DELETE /products) are locked in the API docs.
// If a token is stored (e.g. by your login flow) it is attached automatically.
// Change TOKEN_KEY if your login page stores it under a different name.
const TOKEN_KEY = "token";

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    /* localStorage unavailable */
  }
  return config;
});

export default api;
