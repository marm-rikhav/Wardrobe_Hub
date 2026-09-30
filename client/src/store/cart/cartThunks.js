import { createAsyncThunk } from '@reduxjs/toolkit';
import cartApi from '../../api/cart.api.js';

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartApi.getCart();
      return response.data?.cart;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to load cart';
      return rejectWithValue(message);
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ variantId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const response = await cartApi.addItem(variantId, quantity);
      return response.data?.cart;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to add item to cart';
      return rejectWithValue(message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartApi.updateItem(itemId, quantity);
      return response.data?.cart;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to update cart item';
      return rejectWithValue(message);
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await cartApi.removeItem(itemId);
      return response.data?.cart;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to remove cart item';
      return rejectWithValue(message);
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await cartApi.clearCart();
      return { id: null, items: [], subtotal: 0, totalItems: 0 };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to clear cart';
      return rejectWithValue(message);
    }
  }
);

export default {
  fetchCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
