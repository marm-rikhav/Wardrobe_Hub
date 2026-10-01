import apiClient from '../api/apiClient.js';

/**
 * Service for Admin Product operations.
 * Communicates with backend /api/admin/products.
 */
export const productService = {
  /**
   * Fetch paginated products for admin with optional search and filters.
   * @param {{ page?: number, limit?: number, search?: string, categoryId?: string, subcategoryId?: string, isActive?: boolean|string }} [params]
   */
  async getAllProducts(params = {}) {
    const response = await apiClient.get('/admin/products', { params });
    return response.data?.data || { products: [], pagination: {} };
  },

  /**
   * Fetch a single product by ID including variants and images.
   * @param {string} id
   */
  async getProductById(id) {
    const response = await apiClient.get(`/admin/products/${id}`);
    return response.data?.data?.product;
  },

  /**
   * Create a new product with initial variants.
   * @param {Object} data
   */
  async createProduct(data) {
    const response = await apiClient.post('/admin/products', data);
    return response.data?.data?.product;
  },

  /**
   * Update an existing product and/or its variants.
   * @param {string} id
   * @param {Object} data
   */
  async updateProduct(id, data) {
    const response = await apiClient.put(`/admin/products/${id}`, data);
    return response.data?.data?.product;
  },

  /**
   * Permanently delete product and its variants.
   * @param {string} id
   */
  async deleteProduct(id) {
    const response = await apiClient.delete(`/admin/products/${id}`);
    return response.data;
  },

  /**
   * Toggle active status of a product.
   * @param {string} id
   * @param {boolean} isActive
   */
  async toggleProductStatus(id, isActive) {
    const response = await apiClient.put(`/admin/products/${id}`, { isActive });
    return response.data?.data?.product;
  },

  /**
   * Upload an image to Cloudinary and attach to product.
   * Uses multipart/form-data with field 'image'.
   * @param {string} productId
   * @param {File} file
   * @param {{ color?: string, sortOrder?: number }} [options]
   */
  async uploadProductImage(productId, file, options = {}) {
    const formData = new FormData();
    formData.append('image', file);
    if (options.color) {
      formData.append('color', options.color);
    }
    if (options.sortOrder !== undefined && options.sortOrder !== null) {
      formData.append('sortOrder', String(options.sortOrder));
    }

    const response = await apiClient.post(
      `/admin/products/${productId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data?.data?.image;
  },

  /**
   * Delete an image from a product.
   * @param {string} productId
   * @param {string} imageId
   */
  async deleteProductImage(productId, imageId) {
    const response = await apiClient.delete(
      `/admin/products/${productId}/images/${imageId}`
    );
    return response.data;
  },
};

export default productService;
