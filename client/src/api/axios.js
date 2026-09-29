import axios from 'axios';
import { API_BASE_URL } from '../utils/constants.js';
import { getAccessToken, setAccessToken, clearAccessToken } from '../utils/storage.js';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Callback for AuthContext to sync user/auth state upon refresh failure or success
let onTokenRefreshed = null;
let onAuthFailed = null;

export const setAuthCallbacks = ({ onRefreshed, onFailed }) => {
  onTokenRefreshed = onRefreshed;
  onAuthFailed = onFailed;
};

// Queue mechanism for handling simultaneous 401s
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach in-memory access token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401 and refresh automatically using HTTP-only cookie
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If no response (network error) or error isn't 401, reject immediately
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Don't attempt refresh if the failed request was already login, register, or refresh itself
    const requestUrl = originalRequest.url || '';
    if (
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    // Check if this request has already been retried once
    if (originalRequest._retry) {
      if (onAuthFailed) onAuthFailed();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // If another request is currently refreshing the token, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      // Call backend refresh endpoint - browser automatically sends HTTP-only refresh cookie
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const newAccessToken = response.data?.data?.accessToken;
      if (!newAccessToken) {
        throw new Error('No access token returned from refresh endpoint');
      }

      // Update in-memory token
      setAccessToken(newAccessToken);
      if (onTokenRefreshed) {
        onTokenRefreshed(newAccessToken);
      }

      processQueue(null, newAccessToken);

      // Retry original request with the new access token
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAccessToken();
      if (onAuthFailed) {
        onAuthFailed();
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
