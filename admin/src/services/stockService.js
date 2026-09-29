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
   * Calls the existing backend product update endpoint atomically.
   *
   * @param {string} productId
   * @param {Object} variant - The existing variant object (needs id, sku, size, color)
   * @param {number} newStock - New integer stock value (>= 0)
   */
  async updateVariantStock(productId, variant, newStock) {
    const payload = {
      variants: [
        {
          id: variant.id,
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          price: variant.price !== undefined && variant.price !== null ? Number(variant.price) : undefined,
          stock: Number(newStock),
          isActive: variant.isActive ?? true,
        },
      ],
    };

    const response = await apiClient.put(`/admin/products/${productId}`, payload);
    return response.data?.data?.product;
  },
};

export default stockService;
