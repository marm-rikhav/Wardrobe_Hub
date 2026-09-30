import api from './axios.js';

export const orderApi = {
  createOrder: async ({ addressId, paymentMethod = 'COD' }) => {
    const response = await api.post('/orders', { addressId, paymentMethod });
    return response.data;
  },

  getOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  cancelOrder: async (id) => {
    const response = await api.patch(`/orders/${id}/cancel`);
    return response.data;
  },

  createReturnRequest: async (id, { type, reason, details }) => {
    const response = await api.post(`/orders/${id}/return-request`, { type, reason, details });
    return response.data;
  },

  getReturnRequest: async (id) => {
    const response = await api.get(`/orders/${id}/return-request`);
    return response.data;
  },
};

export default orderApi;
