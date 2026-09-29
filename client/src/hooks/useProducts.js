import { useState, useEffect, useCallback } from 'react';
import productApi from '../api/product.api.js';

export const useProducts = (params = {}) => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Serialize params to safely trigger effect when values actually change
  const serializedParams = JSON.stringify(params);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const parsedParams = JSON.parse(serializedParams);
      const response = await productApi.getProducts(parsedParams);
      setProducts(response.data?.products || []);
      if (response.data?.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [serializedParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    pagination,
    loading,
    error,
    refetch: fetchProducts,
  };
};

export default useProducts;
