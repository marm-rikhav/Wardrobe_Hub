import { useState, useEffect, useCallback } from 'react';
import productService from '../services/productService.js';

export const useProduct = (productId = null) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(Boolean(productId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchProduct = useCallback(async (id = productId) => {
    if (!id) {
      setProduct(null);
      setLoading(false);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getProductById(id);
      setProduct(data);
      return { success: true, data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to load product details';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    }
  }, [productId, fetchProduct]);

  const saveProduct = async (data, id = productId) => {
    setSaving(true);
    setError(null);
    try {
      let saved;
      if (id) {
        saved = await productService.updateProduct(id, data);
      } else {
        saved = await productService.createProduct(data);
      }
      setProduct(saved);
      return saved;
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file, options = {}) => {
    if (!product?.id) throw new Error('Product must exist before uploading images');
    const image = await productService.uploadProductImage(product.id, file, options);
    await fetchProduct(product.id);
    return image;
  };

  const deleteImage = async (imageId) => {
    if (!product?.id) throw new Error('Product must exist before deleting images');
    const result = await productService.deleteProductImage(product.id, imageId);
    await fetchProduct(product.id);
    return result;
  };

  return {
    product,
    setProduct,
    loading,
    saving,
    error,
    refetch: fetchProduct,
    saveProduct,
    uploadImage,
    deleteImage,
  };
};

export default useProduct;
