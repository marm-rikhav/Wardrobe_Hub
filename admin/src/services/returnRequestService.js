import apiClient from '../api/apiClient.js';

/**
 * Service for Admin Return & Exchange Requests Management.
 */
export const returnRequestService = {
  /**
   * Fetch all return/exchange requests with optional status/type filter and pagination
   * @param {{ status?: string, type?: string, page?: number, limit?: number }} [params]
   */
  async getReturnRequests(params = {}) {
    const cleanParams = {};
    if (params.status && params.status !== 'ALL') {
      cleanParams.status = params.status;
    }
    if (params.type && params.type !== 'ALL') {
      cleanParams.type = params.type;
    }
    if (params.page) {
      cleanParams.page = params.page;
    }
    if (params.limit) {
      cleanParams.limit = params.limit;
    }

    const response = await apiClient.get('/admin/returns', { params: cleanParams });
    return response.data?.data || { requests: [], pagination: {} };
  },

  /**
   * Fetch single return request details by ID
   * @param {string} id
   */
  async getReturnRequestById(id) {
    const response = await apiClient.get(`/admin/returns/${id}`);
    return response.data?.data?.request;
  },

  /**
   * Update return request status (Approve or Reject)
   * @param {string} id
   * @param {{ status: 'APPROVED' | 'REJECTED', adminResponse?: string }} payload
   */
  async updateReturnRequestStatus(id, { status, adminResponse }) {
    const response = await apiClient.patch(`/admin/returns/${id}`, {
      status,
      adminResponse,
    });
    return response.data?.data?.request;
  },
};

export default returnRequestService;
