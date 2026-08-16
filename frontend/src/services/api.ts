import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mmconnect.token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error?.message ?? error.message ?? "Request failed";
    return Promise.reject(new Error(message));
  }
);

export default api;
