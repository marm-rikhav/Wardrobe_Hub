import { useState, useEffect, useCallback, useRef } from 'react';
import productService from '../services/productService.js';

export const useProducts = (initialParams = {}) => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const paramsRef = useRef(initialParams);

  const fetchProducts = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    if (params) {
      paramsRef.current = { ...paramsRef.current, ...params };
    }
    try {
      const data = await productService.getAllProducts(paramsRef.current);
      setProducts(data.products || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
      return { success: true, data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to load products';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const deleteProduct = async (id) => {
    const result = await productService.deleteProduct(id);
    await fetchProducts();
    return result;
  };

  const toggleProductStatus = async (id, isActive) => {
    const updated = await productService.toggleProductStatus(id, isActive);
    await fetchProducts();
    return updated;
  };

  return {
    products,
    pagination,
    loading,
    error,
    refetch: fetchProducts,
    deleteProduct,
    toggleProductStatus,
  };
};

export default useProducts;
