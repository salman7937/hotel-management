import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Access Token if available
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// A 401 from these endpoints means "bad/missing credentials", never "expired
// access token" — so we must NOT try to silently refresh (that would surface a
// misleading "refresh token" error instead of "Invalid email or password").
const NO_REFRESH_PATHS = ["/auth/login", "/auth/register", "/auth/refresh"];

// Response Interceptor: Handle 401 & Silent Refresh Token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url: string = originalRequest?.url || "";
    const skipRefresh = NO_REFRESH_PATHS.some((p) => url.includes(p));

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !skipRefresh
    ) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newAccessToken = refreshResponse.data?.data?.accessToken;
        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return axiosInstance(originalRequest);
        }
      } catch {
        // Refresh failed — the session is genuinely gone.
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
        }
      }
      // Reject with the ORIGINAL error so callers see the real cause,
      // not the internal refresh failure.
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
