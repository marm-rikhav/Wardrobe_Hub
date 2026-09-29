import api from './axios.js';

export const productApi = {
  getProducts: async (params = {}) => {
    // Filter out empty string or undefined keys
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      const val = params[key];
      if (val !== undefined && val !== null && val !== '') {
        cleanParams[key] = val;
      }
    });

    const response = await api.get('/products', { params: cleanParams });
    return response.data;
  },

  getProductBySlug: async (slug) => {
    const response = await api.get(`/products/${slug}`);
    return response.data;
  },
};

export default productApi;
