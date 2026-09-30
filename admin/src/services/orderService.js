import apiClient from '../api/apiClient.js';

/**
 * Service for Admin Orders Management.
 * Reuses the existing apiClient instance and token/cookie interceptors.
 */
export const orderService = {
  /**
   * Fetch all orders with optional status filter and pagination
   * @param {{ status?: string, page?: number, limit?: number }} [params]
   */
  async getOrders(params = {}) {
    const cleanParams = {};
    if (params.status && params.status !== 'ALL') {
      cleanParams.status = params.status;
    }
    if (params.page) {
      cleanParams.page = params.page;
    }
    if (params.limit) {
      cleanParams.limit = params.limit;
    }

    const response = await apiClient.get('/admin/orders', { params: cleanParams });
    return response.data?.data || { orders: [] };
  },

  /**
   * Fetch single order detail by ID
   * @param {string} orderId
   */
  async getOrderById(orderId) {
    const response = await apiClient.get(`/admin/orders/${orderId}`);
    return response.data?.data?.order;
  },

  /**
   * Update order status
   * @param {string} orderId
   * @param {string} status
   */
  async updateOrderStatus(orderId, status) {
    const response = await apiClient.patch(`/admin/orders/${orderId}/status`, {
      status,
    });
    return response.data?.data?.order;
  },

  /**
   * Update order payment status (e.g. mark COD as PAID)
   * @param {string} orderId
   * @param {string} paymentStatus
   */
  async updatePaymentStatus(orderId, paymentStatus) {
    const response = await apiClient.patch(`/admin/orders/${orderId}/payment-status`, {
      paymentStatus,
    });
    return response.data?.data?.order;
  },
};

export default orderService;
