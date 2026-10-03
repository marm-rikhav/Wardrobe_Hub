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

  /**
   * Fetch customer details including recent orders and addresses
   * @param {string} id
   */
  async getCustomerById(id) {
    const response = await apiClient.get(`/admin/customers/${id}`);
    return response.data?.data?.customer || response.data?.data;
  },

  /**
   * Update customer profile
   * @param {string} id
   * @param {{ name?: string, email?: string, phone?: string, isActive?: boolean }} data
   */
  async updateCustomer(id, data) {
    const response = await apiClient.put(`/admin/customers/${id}`, data);
    return response.data?.data?.customer || response.data?.data;
  },

  /**
   * Toggle customer active status
   * @param {string} id
   * @param {boolean} isActive
   */
  async toggleCustomerStatus(id, isActive) {
    const response = await apiClient.patch(`/admin/customers/${id}/status`, { isActive });
    return response.data?.data?.customer || response.data?.data;
  },

  /**
   * Delete a customer (only if they have 0 orders)
   * @param {string} id
   */
  async deleteCustomer(id) {
    const response = await apiClient.delete(`/admin/customers/${id}`);
    return response.data?.data;
  },

  /**
   * Update a specific customer address
   * @param {string} customerId
   * @param {string} addressId
   * @param {{ name?: string, phone?: string, address?: string, city?: string, state?: string, postalCode?: string, country?: string, isDefault?: boolean }} data
   */
  async updateCustomerAddress(customerId, addressId, data) {
    const response = await apiClient.put(`/admin/customers/${customerId}/addresses/${addressId}`, data);
    return response.data?.data?.address || response.data?.data;
  },

  /**
   * Create customer with address (created as deactivated by default)
   * @param {{ name: string, email: string, password: string, phone?: string, address?: object }} data
   */
  async createCustomer(data) {
    const response = await apiClient.post('/admin/customers', data);
    return response.data?.data?.customer || response.data?.data;
  },
};

export default customerService;
