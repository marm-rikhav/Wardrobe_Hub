import { useState, useEffect, useCallback } from 'react';
import returnRequestService from '../services/returnRequestService.js';

export const useReturnRequest = (requestId = null) => {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(Boolean(requestId));
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRequest = useCallback(async (id = requestId) => {
    if (!id) {
      setRequest(null);
      setLoading(false);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await returnRequestService.getReturnRequestById(id);
      setRequest(data);
      return { success: true, data };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || 'Failed to load return request details.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    if (requestId) {
      fetchRequest(requestId);
    }
  }, [requestId, fetchRequest]);

  const updateStatus = async (status, adminResponse, id = requestId) => {
    if (!id) return null;
    setActionLoading(true);
    try {
      const updated = await returnRequestService.updateReturnRequestStatus(id, {
        status,
        adminResponse,
      });
      setRequest(updated);
      return updated;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    request,
    loading,
    actionLoading,
    error,
    refetch: fetchRequest,
    updateStatus,
  };
};

export default useReturnRequest;
