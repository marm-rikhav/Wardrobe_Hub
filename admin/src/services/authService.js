import apiClient, {
  setAccessToken,
  clearAccessToken,
} from '../api/apiClient.js';

/**
 * Authentication service communicating directly with existing backend /api/auth endpoints.
 */
export const authService = {
  /**
   * Log in admin user with email and password
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} { user, accessToken }
   */
  async login(credentials) {
    const response = await apiClient.post('/auth/login', {
      email: credentials.email.trim(),
      password: credentials.password,
    });

    const { accessToken, user } = response.data?.data || {};

    if (accessToken) {
      setAccessToken(accessToken);
    }

    return { user, accessToken };
  },

  /**
   * Refresh access token using backend HttpOnly cookie
   * @returns {Promise<string>} new accessToken
   */
  async refreshToken() {
    const response = await apiClient.post('/auth/refresh');
    const { accessToken } = response.data?.data || {};

    if (accessToken) {
      setAccessToken(accessToken);
    }

    return accessToken;
  },

  /**
   * Fetch current authenticated user profile
   * @returns {Promise<Object>} user
   */
  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    return response.data?.data?.user;
  },

  /**
   * Verify admin role privileges
   * @returns {Promise<Object>} verification data
   */
  async verifyAdmin() {
    const response = await apiClient.get('/auth/admin-check');
    return response.data?.data;
  },

  /**
   * Log out user: clears backend cookie and frontend access token
   */
  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Even if backend fails (e.g. offline), we still clear local state
      console.warn('Backend logout encountered an error:', error.message);
    } finally {
      clearAccessToken();
    }
  },
};

export default authService;
