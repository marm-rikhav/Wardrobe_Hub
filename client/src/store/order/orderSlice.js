import { createSlice } from '@reduxjs/toolkit';
import {
  fetchUserOrders,
  fetchOrderById,
  cancelOrder,
  createReturnRequest,
  fetchReturnRequest,
} from './orderThunks.js';

const initialState = {
  orders: [],
  currentOrder: null,
  returnRequest: null,
  loading: false,
  actionLoading: false,
  error: null,
  successMessage: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetOrderState: () => initialState,
    clearOrderError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
  },
  extraReducers: (builder) => {
    // fetchUserOrders
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload || [];
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // fetchOrderById
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        if (action.payload?.returnRequests && action.payload.returnRequests.length > 0) {
          state.returnRequest = action.payload.returnRequests[0];
        } else {
          state.returnRequest = null;
        }
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // cancelOrder
    builder
      .addCase(cancelOrder.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload;
        if (updated) {
          state.currentOrder = updated;
          state.orders = state.orders.map((o) => (o.id === updated.id ? updated : o));
        }
        state.successMessage = 'Order cancelled successfully';
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // createReturnRequest
    builder
      .addCase(createReturnRequest.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createReturnRequest.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.returnRequest = action.payload;
        if (state.currentOrder) {
          const reqs = state.currentOrder.returnRequests || [];
          state.currentOrder = {
            ...state.currentOrder,
            returnRequests: [action.payload, ...reqs],
          };
        }
        state.successMessage = `${
          action.payload?.type === 'RETURN' ? 'Return' : 'Exchange'
        } request submitted successfully`;
      })
      .addCase(createReturnRequest.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // fetchReturnRequest
    builder
      .addCase(fetchReturnRequest.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchReturnRequest.fulfilled, (state, action) => {
        state.returnRequest = action.payload;
      })
      .addCase(fetchReturnRequest.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  resetOrderState,
  clearOrderError,
  clearSuccessMessage,
  setCurrentOrder,
} = orderSlice.actions;

// Selectors
export const selectOrders = (state) => state.order.orders;
export const selectCurrentOrder = (state) => state.order.currentOrder;
export const selectReturnRequest = (state) => state.order.returnRequest;
export const selectOrderLoading = (state) => state.order.loading;
export const selectOrderActionLoading = (state) => state.order.actionLoading;
export const selectOrderError = (state) => state.order.error;
export const selectOrderSuccessMessage = (state) => state.order.successMessage;

export default orderSlice.reducer;
