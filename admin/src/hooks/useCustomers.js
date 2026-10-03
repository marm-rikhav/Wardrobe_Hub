import { useState, useEffect, useCallback, useRef } from 'react';
import customerService from '../services/customerService.js';

export const useCustomers = (initialParams = {}) => {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const paramsRef = useRef(initialParams);

  const fetchCustomers = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    if (params) {
      paramsRef.current = { ...paramsRef.current, ...params };
    }
    try {
      const data = await customerService.getCustomers(paramsRef.current);
      const fetchedCustomers = data.customers || [];
      const totalCount =
        typeof data.pagination?.total === 'number'
          ? data.pagination.total
          : fetchedCustomers.length;

      setCustomers(fetchedCustomers);
      setPagination((prev) => ({
        ...prev,
        ...data.pagination,
        total: totalCount,
      }));
      return { success: true, data };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        'Failed to load customer list. Please check your connection and try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const toggleCustomerStatus = async (id, isActive) => {
    const updated = await customerService.toggleCustomerStatus(id, isActive);
    await fetchCustomers();
    return updated;
  };

  const deleteCustomer = async (id) => {
    const result = await customerService.deleteCustomer(id);
    await fetchCustomers();
    return result;
  };

  return {
    customers,
    pagination,
    setPagination,
    loading,
    error,
    refetch: fetchCustomers,
    toggleCustomerStatus,
    deleteCustomer,
  };
};

export default useCustomers;
