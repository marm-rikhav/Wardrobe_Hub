import { useState, useEffect, useCallback } from 'react';
import addressApi from '../api/address.api.js';

export const useAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await addressApi.getAddresses();
      setAddresses(response.data?.addresses || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const addAddress = async (data) => {
    setLoading(true);
    try {
      const response = await addressApi.createAddress(data);
      await fetchAddresses();
      return { success: true, address: response.data?.address };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to add address';
      const errors = err.response?.data?.errors;
      return { success: false, message, errors };
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = async (id, data) => {
    setLoading(true);
    try {
      const response = await addressApi.updateAddress(id, data);
      await fetchAddresses();
      return { success: true, address: response.data?.address };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to update address';
      const errors = err.response?.data?.errors;
      return { success: false, message, errors };
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (id) => {
    setLoading(true);
    try {
      await addressApi.deleteAddress(id);
      await fetchAddresses();
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to delete address';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const setDefaultAddress = async (id) => {
    setLoading(true);
    try {
      await addressApi.setDefaultAddress(id);
      await fetchAddresses();
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to set default address';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return {
    addresses,
    loading,
    error,
    refetch: fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };
};

export default useAddresses;
