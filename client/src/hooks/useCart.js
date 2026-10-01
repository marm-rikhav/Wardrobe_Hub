import { useSelector, useDispatch } from 'react-redux';
import {
  selectCart,
  selectCartItems,
  selectCartTotalItems,
  selectCartSubtotal,
  selectCartLoading,
  selectCartActionLoading,
  selectCartError,
  clearCartError,
  resetCart,
} from '../store/cart/cartSlice.js';
import {
  fetchCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../store/cart/cartThunks.js';

export const useCart = () => {
  const dispatch = useDispatch();
  const cart = useSelector(selectCart);
  const items = useSelector(selectCartItems);
  const totalItems = useSelector(selectCartTotalItems);
  const subtotal = useSelector(selectCartSubtotal);
  const loading = useSelector(selectCartLoading);
  const actionLoading = useSelector(selectCartActionLoading);
  const error = useSelector(selectCartError);

  const getCart = () => dispatch(fetchCart());
  const addItem = async (variantId, quantity = 1) =>
    dispatch(addToCart({ variantId, quantity }));
  const updateQuantity = (itemId, quantity) =>
    dispatch(updateCartItem({ itemId, quantity }));
  const removeItem = (itemId) => dispatch(removeCartItem(itemId));
  const emptyCart = () => dispatch(clearCart());
  const dismissError = () => dispatch(clearCartError());
  const reset = () => dispatch(resetCart());

  return {
    cart,
    items,
    totalItems,
    subtotal,
    loading,
    actionLoading,
    error,
    getCart,
    addItem,
    updateQuantity,
    removeItem,
    emptyCart,
    dismissError,
    reset,
  };
};

export default useCart;
