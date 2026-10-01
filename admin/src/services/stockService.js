import apiClient from '../api/apiClient.js';
import productService from './productService.js';

/**
 * Service for Variant-level Stock Management.
 * Follows backend architecture: stock belongs to product_variants.
 */
export const stockService = {
  /**
   * Fetch products with variants for the stock overview table.
   * @param {{ page?: number, limit?: number, search?: string, categoryId?: string, subcategoryId?: string, isActive?: boolean|string }} [params]
   */
  async getStockList(params = {}) {
    return await productService.getAllProducts(params);
  },

  /**
   * Update stock for a specific variant.
   * Calls the dedicated backend variant stock update endpoint atomically.
   *
   * @param {string} productId
   * @param {Object} variant - The existing variant object (needs id)
   * @param {number} newStock - New integer stock value (>= 0)
   */
  async updateVariantStock(productId, variant, newStock) {
    const response = await apiClient.patch(
      `/admin/products/${productId}/variants/${variant.id}/stock`,
      { stock: Number(newStock) }
    );
    return response.data?.data?.variant;
  },
};

export default stockService;
