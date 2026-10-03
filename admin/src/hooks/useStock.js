import { useState, useEffect, useCallback } from 'react';
import stockService from '../services/stockService.js';
import categoryService from '../services/categoryService.js';

export const useStock = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStock = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const [stockData, categoriesData] = await Promise.all([
        stockService.getStockList(params),
        categoryService.getAllCategories(),
      ]);
      setProducts(stockData.products || []);
      setCategories(categoriesData || []);
      return { success: true, products: stockData.products, categories: categoriesData };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to load stock data';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const updateVariantStock = async (productId, variant, newStock, currentParams = {}) => {
    const updated = await stockService.updateVariantStock(productId, variant, newStock);
    await fetchStock(currentParams);
    return updated;
  };

  return {
    products,
    categories,
    loading,
    error,
    refetch: fetchStock,
    updateVariantStock,
  };
};

export default useStock;
