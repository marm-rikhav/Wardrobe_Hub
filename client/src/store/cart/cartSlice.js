import { createSlice } from '@reduxjs/toolkit';
import {
  fetchCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from './cartThunks.js';

const initialState = {
  id: null,
  items: [],
  totalItems: 0,
  subtotal: 0,
  loading: false,
  actionLoading: false,
  itemLoading: {}, // itemId -> boolean
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart: () => initialState,
    clearCartError: (state) => {
      state.error = null;
    },
    setCart: (state, action) => {
      if (action.payload) {
        state.id = action.payload.id || null;
        state.items = action.payload.items || [];
        state.totalItems = action.payload.totalItems || 0;
        state.subtotal = action.payload.subtotal || 0;
      }
    },
  },
  extraReducers: (builder) => {
    // fetchCart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.id = action.payload.id || null;
          state.items = action.payload.items || [];
          state.totalItems = action.payload.totalItems || 0;
          state.subtotal = action.payload.subtotal || 0;
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // addToCart
    builder
      .addCase(addToCart.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload) {
          state.id = action.payload.id || null;
          state.items = action.payload.items || [];
          state.totalItems = action.payload.totalItems || 0;
          state.subtotal = action.payload.subtotal || 0;
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // updateCartItem
    builder
      .addCase(updateCartItem.pending, (state, action) => {
        const itemId = action.meta?.arg?.itemId;
        if (itemId) state.itemLoading[itemId] = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const itemId = action.meta?.arg?.itemId;
        if (itemId) delete state.itemLoading[itemId];
        if (action.payload) {
          state.id = action.payload.id || null;
          state.items = action.payload.items || [];
          state.totalItems = action.payload.totalItems || 0;
          state.subtotal = action.payload.subtotal || 0;
        }
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        const itemId = action.meta?.arg?.itemId;
        if (itemId) delete state.itemLoading[itemId];
        state.error = action.payload;
      });

    // removeCartItem
    builder
      .addCase(removeCartItem.pending, (state, action) => {
        const itemId = action.meta?.arg;
        if (itemId) state.itemLoading[itemId] = true;
        state.error = null;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        const itemId = action.meta?.arg;
        if (itemId) delete state.itemLoading[itemId];
        if (action.payload) {
          state.id = action.payload.id || null;
          state.items = action.payload.items || [];
          state.totalItems = action.payload.totalItems || 0;
          state.subtotal = action.payload.subtotal || 0;
        }
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        const itemId = action.meta?.arg;
        if (itemId) delete state.itemLoading[itemId];
        state.error = action.payload;
      });

    // clearCart
    builder
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.id = null;
        state.items = [];
        state.totalItems = 0;
        state.subtotal = 0;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCart, clearCartError, setCart } = cartSlice.actions;

// Selectors
export const selectCart = (state) => state.cart;
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalItems = (state) => state.cart.totalItems;
export const selectCartSubtotal = (state) => state.cart.subtotal;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartActionLoading = (state) => state.cart.actionLoading;
export const selectCartItemLoading = (state, itemId) => Boolean(state.cart.itemLoading[itemId]);
export const selectCartError = (state) => state.cart.error;

export default cartSlice.reducer;
