import apiClient from '../api/apiClient.js';

/**
 * Service for Admin Category operations.
 * Communicates with backend /api/admin/categories and /api/categories.
 */
export const categoryService = {
  /**
   * Fetch all categories for admin (includes inactive categories and subcategory counts).
   */
  async getAllCategories() {
    const response = await apiClient.get('/admin/categories');
    return response.data?.data?.categories || [];
  },

  /**
   * Fetch a single category by ID with its subcategories.
   */
  async getCategoryById(id) {
    const response = await apiClient.get(`/admin/categories/${id}`);
    return response.data?.data?.category;
  },

  /**
   * Create a new category.
   * @param {{ name: string, slug?: string, imageUrl?: string, isActive?: boolean }} data
   */
  async createCategory(data) {
    const response = await apiClient.post('/admin/categories', data);
    return response.data?.data?.category;
  },

  /**
   * Update an existing category.
   * @param {string} id
   * @param {{ name?: string, slug?: string, imageUrl?: string, isActive?: boolean }} data
   */
  async updateCategory(id, data) {
    const response = await apiClient.put(`/admin/categories/${id}`, data);
    return response.data?.data?.category;
  },

  /**
   * Soft delete category (sets isActive to false on category and subcategories).
   * @param {string} id
   */
  async deleteCategory(id) {
    const response = await apiClient.delete(`/admin/categories/${id}`);
    return response.data;
  },

  /**
   * Toggle active status of a category.
   * @param {string} id
   * @param {boolean} isActive
   */
  async toggleCategoryStatus(id, isActive) {
    const response = await apiClient.put(`/admin/categories/${id}`, { isActive });
    return response.data?.data?.category;
  },
};

export default categoryService;
