import { useState, useEffect, useCallback } from 'react';
import categoryService from '../services/categoryService.js';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
      return { success: true, data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to load categories';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (data) => {
    const created = await categoryService.createCategory(data);
    await fetchCategories();
    return created;
  };

  const updateCategory = async (id, data) => {
    const updated = await categoryService.updateCategory(id, data);
    await fetchCategories();
    return updated;
  };

  const deleteCategory = async (id) => {
    const result = await categoryService.deleteCategory(id);
    await fetchCategories();
    return result;
  };

  const toggleCategoryStatus = async (id, isActive) => {
    const updated = await categoryService.toggleCategoryStatus(id, isActive);
    await fetchCategories();
    return updated;
  };

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
  };
};

export default useCategories;
