import { useMemo } from 'react';
import useAuth from './useAuth.js';

export const useSettings = () => {
  const { user, loading, logout } = useAuth();

  const adminInfo = useMemo(() => {
    return {
      id: user?.id || null,
      name: user?.name || 'Administrator',
      email: user?.email || '—',
      role: user?.role || 'ADMIN',
      isAuthenticated: Boolean(user),
    };
  }, [user]);

  return {
    user,
    adminInfo,
    loading,
    logout,
  };
};

export default useSettings;
