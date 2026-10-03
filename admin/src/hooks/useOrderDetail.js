import { useState, useEffect, useCallback } from 'react';
import orderService from '../services/orderService.js';

export const useOrderDetail = (orderId = null) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async (id = orderId) => {
    if (!id) {
      setOrder(null);
      setLoading(false);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getOrderById(id);
      setOrder(data);
      return { success: true, order: data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to load order details';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId, fetchOrder]);

  const updateOrderStatus = async (status, id = orderId) => {
    if (!id) return;
    setUpdating(true);
    setError(null);
    try {
      const updated = await orderService.updateOrderStatus(id, status);
      setOrder(updated);
      return updated;
    } finally {
      setUpdating(false);
    }
  };

  const updatePaymentStatus = async (paymentStatus, id = orderId) => {
    if (!id) return;
    setUpdating(true);
    setError(null);
    try {
      const updated = await orderService.updatePaymentStatus(id, paymentStatus);
      setOrder(updated);
      return updated;
    } finally {
      setUpdating(false);
    }
  };

  return {
    order,
    loading,
    updating,
    error,
    refetch: fetchOrder,
    updateOrderStatus,
    updatePaymentStatus,
  };
};

export default useOrderDetail;
