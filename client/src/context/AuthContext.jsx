import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import authApi from '../api/auth.api.js';
import { setAuthCallbacks } from '../api/axios.js';
import { setAccessToken, clearAccessToken } from '../utils/storage.js';
import store from '../store/store.js';
import { fetchCart } from '../store/cart/cartThunks.js';
import { resetCart } from '../store/cart/cartSlice.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync token state and in-memory store
  const handleTokenUpdate = useCallback((newToken) => {
    setAccessToken(newToken);
    setTokenState(newToken);
  }, []);

  const handleAuthFailed = useCallback(() => {
    clearAccessToken();
    setTokenState(null);
    setUser(null);
    store.dispatch(resetCart());
  }, []);

  // Register Axios callbacks to keep AuthContext and Axios interceptor in sync
  useEffect(() => {
    setAuthCallbacks({
      onRefreshed: (newToken) => {
        handleTokenUpdate(newToken);
      },
      onFailed: () => {
        handleAuthFailed();
      },
    });
  }, [handleTokenUpdate, handleAuthFailed]);

  // Refresh session on app launch using HTTP-only cookie
  const refreshSession = useCallback(async () => {
    try {
      // 1. Ask backend for fresh access token via HTTP-only cookie
      const refreshResult = await authApi.refreshToken();
      const newToken = refreshResult?.data?.accessToken;

      if (newToken) {
        handleTokenUpdate(newToken);

        // 2. Fetch current user profile with the fresh access token
        const userResult = await authApi.getCurrentUser();
        const userData = userResult?.data?.user;
        setUser(userData || null);
        if (userData) {
          store.dispatch(fetchCart());
        }
        return true;
      }
    } catch {
      handleAuthFailed();
      return false;
    } finally {
      setLoading(false);
    }
    return false;
  }, [handleTokenUpdate, handleAuthFailed]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  // Login handler
  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await authApi.login(credentials);
      const { accessToken: newToken, user: loggedUser } = response.data || {};
      if (newToken) {
        handleTokenUpdate(newToken);
      }
      setUser(loggedUser || null);
      if (loggedUser) {
        store.dispatch(fetchCart());
      }
      return { success: true, user: loggedUser };
    } catch (error) {
      handleAuthFailed();
      const message =
        error.response?.data?.message || error.message || 'Login failed';
      const errors = error.response?.data?.errors;
      return { success: false, message, errors };
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authApi.register(userData);
      const { accessToken: newToken, user: newUser } = response.data || {};
      if (newToken) {
        handleTokenUpdate(newToken);
      }
      setUser(newUser || null);
      if (newUser) {
        store.dispatch(fetchCart());
      }
      return { success: true, user: newUser };
    } catch (error) {
      handleAuthFailed();
      const message =
        error.response?.data?.message || error.message || 'Registration failed';
      const errors = error.response?.data?.errors;
      return { success: false, message, errors };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
    } catch {
      // Even if network fails, clear local state
    } finally {
      handleAuthFailed();
      setLoading(false);
    }
  };

  // Update user state locally when profile is edited
  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  const value = {
    user,
    accessToken,
    isAuthenticated: Boolean(accessToken && user),
    loading,
    login,
    register,
    logout,
    refreshSession,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
