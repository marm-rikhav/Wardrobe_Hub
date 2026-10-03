import { useState, useEffect, useCallback, useRef } from 'react';
import orderService from '../services/orderService.js';

export const useOrders = (initialParams = {}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const paramsRef = useRef(initialParams);

  const fetchOrders = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    if (params) {
      paramsRef.current = { ...paramsRef.current, ...params };
    }
    try {
      const data = await orderService.getOrders(paramsRef.current);
      setOrders(data.orders || []);
      return { success: true, orders: data.orders };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to load orders';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
  };
};

export default useOrders;
