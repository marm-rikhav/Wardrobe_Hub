import { useState, useEffect, useCallback } from 'react';
import userApi from '../api/user.api.js';
import { useAuth } from './useAuth.js';

export const useProfile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userApi.getProfile();
      const fetchedUser = response.data?.user;
      setProfile(fetchedUser);
      if (fetchedUser) {
        updateUser(fetchedUser);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    if (user) {
      setProfile(user);
    }
  }, [user]);

  const updateProfile = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userApi.updateProfile(formData);
      const updatedUser = response.data?.user;
      setProfile(updatedUser);
      if (updatedUser) {
        updateUser(updatedUser);
      }
      return { success: true, user: updatedUser };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to update profile';
      const errors = err.response?.data?.errors;
      setError(message);
      return { success: false, message, errors };
    } finally {
      setLoading(false);
    }
  };

  return {
    profile: profile || user,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
};

export default useProfile;
