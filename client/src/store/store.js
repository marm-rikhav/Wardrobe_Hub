import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cart/cartSlice.js';
import orderReducer from './order/orderSlice.js';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    order: orderReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
