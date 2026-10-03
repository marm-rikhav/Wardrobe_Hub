import { useState, useEffect, useCallback, useRef } from 'react';
import returnRequestService from '../services/returnRequestService.js';

export const useReturnRequests = (initialParams = {}) => {
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const paramsRef = useRef(initialParams);

  const fetchRequests = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    if (params) {
      paramsRef.current = { ...paramsRef.current, ...params };
    }
    try {
      const data = await returnRequestService.getReturnRequests(paramsRef.current);
      setRequests(data.requests || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0 });
      return { success: true, data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to load return requests';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const updateRequestStatus = async (id, { status, adminResponse }, currentParams = {}) => {
    setActionLoading(true);
    try {
      const updated = await returnRequestService.updateReturnRequestStatus(id, {
        status,
        adminResponse,
      });
      await fetchRequests(currentParams);
      return updated;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    requests,
    pagination,
    loading,
    actionLoading,
    error,
    refetch: fetchRequests,
    updateRequestStatus,
  };
};

export default useReturnRequests;
