import apiClient from '../api/apiClient.js';

/**
 * Service for Admin Subcategory operations.
 * Communicates with backend /api/admin/subcategories and /api/subcategories.
 */
export const subcategoryService = {
  /**
   * Fetch all subcategories for admin with optional parent category filter.
   * @param {string} [categoryId]
   */
  async getAllSubcategories(categoryId) {
    const params = categoryId ? { categoryId } : {};
    const response = await apiClient.get('/admin/subcategories', { params });
    return response.data?.data?.subcategories || [];
  },

  /**
   * Fetch a single subcategory by ID.
   * @param {string} id
   */
  async getSubcategoryById(id) {
    const response = await apiClient.get(`/admin/subcategories/${id}`);
    return response.data?.data?.subcategory;
  },

  /**
   * Create a new subcategory.
   * @param {{ categoryId: string, name: string, slug?: string, isActive?: boolean }} data
   */
  async createSubcategory(data) {
    const response = await apiClient.post('/admin/subcategories', data);
    return response.data?.data?.subcategory;
  },

  /**
   * Update an existing subcategory.
   * @param {string} id
   * @param {{ categoryId?: string, name?: string, slug?: string, isActive?: boolean }} data
   */
  async updateSubcategory(id, data) {
    const response = await apiClient.put(`/admin/subcategories/${id}`, data);
    return response.data?.data?.subcategory;
  },

  /**
   * Permanently delete subcategory and its associated products.
   * @param {string} id
   */
  async deleteSubcategory(id) {
    const response = await apiClient.delete(`/admin/subcategories/${id}`);
    return response.data;
  },

  /**
   * Toggle active status of a subcategory.
   * @param {string} id
   * @param {boolean} isActive
   */
  async toggleSubcategoryStatus(id, isActive) {
    const response = await apiClient.put(`/admin/subcategories/${id}`, { isActive });
    return response.data?.data?.subcategory;
  },
};

export default subcategoryService;
