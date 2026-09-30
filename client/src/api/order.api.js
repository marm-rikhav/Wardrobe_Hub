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
};

export default orderApi;
