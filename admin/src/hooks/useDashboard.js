import { useState, useEffect, useCallback } from 'react';
import dashboardService from '../services/dashboardService.js';

export const useDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getDashboardStats();
      setStats(data);
      return { success: true, data };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        'Failed to load dashboard metrics. Please check your network and try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    loading,
    error,
    refetch: fetchDashboardData,
  };
};

export default useDashboard;
