import axios from "axios";

const protectedApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error?: any) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(null)
  );
  failedQueue = [];
};

protectedApi.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // 🚫 Explicitly PUBLIC routes
    if (originalRequest?.requiresAuth === false) {
      return Promise.reject(error);
    }

    // 🚫 Never intercept refresh-token itself
    if (originalRequest?.url?.includes("/auth/refresh-token")) {
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // 🔐 Access token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => protectedApi(originalRequest));
      }

      isRefreshing = true;

      try {
        await protectedApi.post("/auth/refresh-token", null, {
          requiresAuth: false, // 🔑 VERY IMPORTANT
        });

        processQueue();
        return protectedApi(originalRequest);
      } catch (err) {
        processQueue(err);
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default protectedApi;
