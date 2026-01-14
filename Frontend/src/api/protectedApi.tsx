import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const protectedApi = axios.create({
  baseURL: API_URL,
});

/* ===============================
   REQUEST INTERCEPTOR
   Attach access token
================================ */
protectedApi.interceptors.request.use((config: any) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ===============================
   REFRESH LOGIC
================================ */
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(null)
  );
  failedQueue = [];
};

/* ===============================
   RESPONSE INTERCEPTOR
================================ */
protectedApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: any = error.config;

    // skip public routes
    if (originalRequest?.requiresAuth === false) {
      return Promise.reject(error);
    }

    // access token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => protectedApi(originalRequest));
      }

      isRefreshing = true;

      try {
        // 🔁 refresh token API
        const refreshToken = localStorage.getItem("refreshToken");

        const refreshRes = await axios.post(
          `${API_URL}/auth/refresh-token`,
          null,
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );


        const { accessToken } = refreshRes.data;

        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
        }

        processQueue();
        return protectedApi(originalRequest);
      } catch (err) {
        processQueue(err);
        localStorage.removeItem("accessToken");
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
