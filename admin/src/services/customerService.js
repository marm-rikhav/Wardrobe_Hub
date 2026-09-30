import apiClient from '../api/apiClient.js';

/**
 * Service for Admin Customer Management.
 */
export const customerService = {
  /**
   * Fetch paginated list of customers with optional search
   * @param {{ page?: number, limit?: number, search?: string }} [params]
   */
  async getCustomers(params = {}) {
    const cleanParams = {};
    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;
    if (params.search?.trim()) {
      cleanParams.search = params.search.trim();
    }

    const response = await apiClient.get('/admin/customers', { params: cleanParams });
    return response.data?.data || { customers: [], pagination: {} };
  },
};

export default customerService;
