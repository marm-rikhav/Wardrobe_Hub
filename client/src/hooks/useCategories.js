import { useState, useEffect, useCallback } from 'react';
import categoryApi from '../api/category.api.js';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryApi.getActiveCategories();
      setCategories(response.data?.categories || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};

export default useCategories;
