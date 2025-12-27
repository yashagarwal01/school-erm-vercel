import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // refresh token cookie
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const res = await api.post("/auth/refresh-token");
      useAuthStore.getState().setAccessToken(res.data.accessToken);

      originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api;
