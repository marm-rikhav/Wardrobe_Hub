import { useState, useEffect, useCallback } from 'react';
import customerService from '../services/customerService.js';

export const useCustomer = (customerId = null) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(Boolean(customerId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomer = useCallback(async (id = customerId) => {
    if (!id) {
      setCustomer(null);
      setLoading(false);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const rawData = await customerService.getCustomerById(id);
      const data = rawData?.customer || rawData;
      setCustomer(data);
      return { success: true, data };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || 'Failed to load customer profile details.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (customerId) {
      fetchCustomer(customerId);
    }
  }, [customerId, fetchCustomer]);

  const updateCustomer = async (data, id = customerId) => {
    if (!id) return null;
    setSaving(true);
    setError(null);
    try {
      const rawUpdated = await customerService.updateCustomer(id, data);
      const updated = rawUpdated?.customer || rawUpdated;
      setCustomer((prev) => (prev ? { ...prev, ...updated } : updated));
      return updated;
    } finally {
      setSaving(false);
    }
  };

  const updateAddress = async (addressId, addressData, id = customerId) => {
    if (!id) return null;
    setSaving(true);
    setError(null);
    try {
      const rawUpdated = await customerService.updateCustomerAddress(id, addressId, addressData);
      const updatedAddr = rawUpdated?.address || rawUpdated || addressData;

      setCustomer((prev) => {
        if (!prev) return prev;
        const currentAddresses = prev.addresses || [];
        const updatedList = currentAddresses.map((a) => {
          if (a.id === addressId) {
            return { ...a, ...updatedAddr };
          }
          if (addressData.isDefault) {
            return { ...a, isDefault: false };
          }
          return a;
        });
        return { ...prev, addresses: updatedList };
      });
      return updatedAddr;
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (nextStatus, id = customerId) => {
    if (!id) return null;
    setSaving(true);
    try {
      const updated = await customerService.toggleCustomerStatus(id, nextStatus);
      setCustomer((prev) => (prev ? { ...prev, isActive: nextStatus } : prev));
      return updated;
    } finally {
      setSaving(false);
    }
  };

  const deleteCustomer = async (id = customerId) => {
    if (!id) return null;
    setSaving(true);
    try {
      return await customerService.deleteCustomer(id);
    } finally {
      setSaving(false);
    }
  };

  const createCustomer = async (data) => {
    setSaving(true);
    setError(null);
    try {
      const created = await customerService.createCustomer(data);
      return created;
    } finally {
      setSaving(false);
    }
  };

  return {
    customer,
    setCustomer,
    loading,
    saving,
    error,
    refetch: fetchCustomer,
    updateCustomer,
    updateAddress,
    toggleStatus,
    deleteCustomer,
    createCustomer,
  };
};

export default useCustomer;
