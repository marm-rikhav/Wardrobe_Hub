import { useState, useEffect, useCallback } from 'react';
import subcategoryService from '../services/subcategoryService.js';
import categoryService from '../services/categoryService.js';

export const useSubcategories = (initialCategoryId = '') => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubcategories = useCallback(async (catId) => {
    setLoading(true);
    setError(null);
    const filterId = catId !== undefined ? catId : selectedCategoryId;
    try {
      const [subsData, catsData] = await Promise.all([
        subcategoryService.getAllSubcategories(filterId || undefined),
        categoryService.getAllCategories(),
      ]);
      setSubcategories(subsData || []);
      setCategories(catsData || []);
      return { success: true, subcategories: subsData, categories: catsData };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to load subcategories';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    fetchSubcategories(selectedCategoryId);
  }, [fetchSubcategories, selectedCategoryId]);

  const createSubcategory = async (data) => {
    const created = await subcategoryService.createSubcategory(data);
    await fetchSubcategories(selectedCategoryId);
    return created;
  };

  const updateSubcategory = async (id, data) => {
    const updated = await subcategoryService.updateSubcategory(id, data);
    await fetchSubcategories(selectedCategoryId);
    return updated;
  };

  const deleteSubcategory = async (id) => {
    const result = await subcategoryService.deleteSubcategory(id);
    await fetchSubcategories(selectedCategoryId);
    return result;
  };

  const toggleSubcategoryStatus = async (id, isActive) => {
    const updated = await subcategoryService.toggleSubcategoryStatus(id, isActive);
    await fetchSubcategories(selectedCategoryId);
    return updated;
  };

  return {
    subcategories,
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    loading,
    error,
    refetch: fetchSubcategories,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    toggleSubcategoryStatus,
  };
};

export default useSubcategories;
