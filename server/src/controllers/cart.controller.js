import cartService from "../services/cart.service.js";

export const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      data: { cart },
    });
  } catch (error) {
    return next(error);
  }
};

export const addItemToCart = async (req, res, next) => {
  try {
    const cart = await cartService.addItemToCart(req.user.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      data: { cart },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const cart = await cartService.updateCartItemQuantity(req.user.id, itemId, quantity);
    return res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: { cart },
    });
  } catch (error) {
    return next(error);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const cart = await cartService.removeCartItem(req.user.id, itemId);
    return res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      data: { cart },
    });
  } catch (error) {
    return next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const result = await cartService.clearCart(req.user.id);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
