import { createAsyncThunk } from '@reduxjs/toolkit';
import orderApi from '../../api/order.api.js';

export const fetchUserOrders = createAsyncThunk(
  'order/fetchUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderApi.getOrders();
      return response.data?.orders || [];
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to load orders';
      return rejectWithValue(message);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'order/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderApi.getOrderById(orderId);
      return response.data?.order || null;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to load order details';
      return rejectWithValue(message);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'order/cancelOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderApi.cancelOrder(orderId);
      return response.data?.order;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to cancel order';
      return rejectWithValue(message);
    }
  }
);

export const createReturnRequest = createAsyncThunk(
  'order/createReturnRequest',
  async ({ orderId, type, reason, details }, { rejectWithValue }) => {
    try {
      const response = await orderApi.createReturnRequest(orderId, {
        type,
        reason,
        details,
      });
      return response.data?.request;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to submit return/exchange request';
      return rejectWithValue(message);
    }
  }
);

export const fetchReturnRequest = createAsyncThunk(
  'order/fetchReturnRequest',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderApi.getReturnRequest(orderId);
      return response.data?.request || null;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to load return request';
      return rejectWithValue(message);
    }
  }
);

export default {
  fetchUserOrders,
  fetchOrderById,
  cancelOrder,
  createReturnRequest,
  fetchReturnRequest,
};
