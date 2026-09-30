import apiClient from '../api/apiClient.js';

/**
 * Service for Admin Dashboard statistics and aggregated metrics.
 */
export const dashboardService = {
  /**
   * Fetch aggregated dashboard statistics
   */
  async getDashboardStats() {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data?.data;
  },
};

export default dashboardService;
