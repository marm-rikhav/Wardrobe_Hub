import axios from 'axios';
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from './tokenStorage.js';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Common Axios instance for the Wardrobe Hub Admin application.
 * Reusable across all admin modules (auth, categories, products, orders, etc.).
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Always send HttpOnly cookies (including refreshToken)
});

// Callback mechanism to notify AuthContext when an unrecoverable auth failure occurs
let authFailureCallback = null;

export const setAuthFailureCallback = (callback) => {
  authFailureCallback = callback;
};

const notifyAuthFailure = () => {
  clearAccessToken();
  if (typeof authFailureCallback === 'function') {
    authFailureCallback();
  }
};

// Queue to hold pending requests while a token refresh is in progress
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

/**
 * Request Interceptor: Automatically attach Bearer token to authenticated requests
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor: Automatically handle 401 & token refresh
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If there is no response (e.g. network failure) or no original config, reject
    if (!error.response || !originalRequest) {
      throw error;
    }

    const status = error.response.status;
    const requestUrl = originalRequest.url || '';

    // Ignore 401 on login or refresh endpoint to avoid refresh loops
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/register');

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Enqueue the request until the current refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            throw err;
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use a separate axios call directly so it doesn't trigger the interceptor again
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken =
          refreshResponse.data?.data?.accessToken;

        if (!newAccessToken) {
          throw new Error('No access token returned from refresh');
        }

        // Store new access token
        setAccessToken(newAccessToken);

        // Update default header and original request header
        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Resolve all queued requests
        processQueue(null, newAccessToken);

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        notifyAuthFailure();
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }

    throw error;
  }
);

export { getAccessToken, setAccessToken, clearAccessToken };
export default apiClient;
