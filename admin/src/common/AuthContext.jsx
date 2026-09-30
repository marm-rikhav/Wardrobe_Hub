import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import authService from '../services/authService.js';
import {
  getAccessToken,
  clearAccessToken,
  setAuthFailureCallback,
} from '../api/apiClient.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to safely clear auth state
  const handleAuthFailure = useCallback(() => {
    clearAccessToken();
    setUser(null);
    setLoading(false);
  }, []);

  // Initialize and check authentication on initial app load
  useEffect(() => {
    // Register global auth failure listener from apiClient
    setAuthFailureCallback(handleAuthFailure);

    const checkAuth = async () => {
      setLoading(true);
      const token = getAccessToken();

      try {
        if (token) {
          // Token exists, verify and get user
          const currentUser = await authService.getCurrentUser();
          if (currentUser?.role === 'ADMIN') {
            setUser(currentUser);
          } else {
            // Not an admin or invalid
            await authService.logout();
            setUser(null);
          }
        } else {
          // No access token in memory/storage, attempt refresh via HttpOnly cookie
          try {
            await authService.refreshToken();
            const currentUser = await authService.getCurrentUser();
            if (currentUser?.role === 'ADMIN') {
              setUser(currentUser);
            } else {
              await authService.logout();
              setUser(null);
            }
          } catch {
            // No valid refresh cookie or expired
            setUser(null);
          }
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth().catch(() => {
      setUser(null);
      setLoading(false);
    });
  }, [handleAuthFailure]);

  /**
   * Log in user and verify admin role
   */
  const login = useCallback(async (credentials) => {
    const { user: loggedInUser } = await authService.login(credentials);

    if (loggedInUser.role !== 'ADMIN') {
      await authService.logout();
      throw new Error('Access denied. Administrator privileges required.');
    }

    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  /**
   * Log out user and clear state
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user?.role === 'ADMIN'),
      loading,
      login,
      logout,
    }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export default AuthContext;
