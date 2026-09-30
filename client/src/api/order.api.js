import api from './axios.js';

export const orderApi = {
  createOrder: async ({ addressId }) => {
    const response = await api.post('/orders', { addressId });
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
};

export default orderApi;
