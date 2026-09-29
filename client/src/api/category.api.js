import api from './axios.js';

export const categoryApi = {
  getActiveCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  getCategoryBySlugOrId: async (idOrSlug) => {
    const response = await api.get(`/categories/${idOrSlug}`);
    return response.data;
  },
};

export default categoryApi;
