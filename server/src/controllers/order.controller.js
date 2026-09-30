import orderService from "../services/order.service.js";

/**
 * Customer: Create a new order
 */
export const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.user.id, req.body);
    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: { order },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Customer: Get customer orders
 */
export const getUserOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getUserOrders(req.user.id);
    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: { orders },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Customer: Get customer order by ID
 */
export const getUserOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getUserOrderById(req.user.id, req.params.id);
    return res.status(200).json({
      success: true,
      message: "Order details fetched successfully",
      data: { order },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: List all orders with status filtering & pagination
 */
export const getAllOrdersAdmin = async (req, res, next) => {
  try {
    const { orders, pagination } = await orderService.getAllOrdersAdmin(req.query);
    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: { orders, pagination },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: Get single order by ID
 */
export const getOrderByIdAdmin = async (req, res, next) => {
  try {
    const order = await orderService.getOrderByIdAdmin(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Order details fetched successfully",
      data: { order },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: Update order status
 */
export const updateOrderStatusAdmin = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatusAdmin(req.params.id, req.body.status);
    return res.status(200).json({
      success: true,
      message: `Order status updated to ${order.status}`,
      data: { order },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Customer: Cancel order
 */
export const cancelCustomerOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelCustomerOrder(req.user.id, req.params.id);
    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: { order },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: Update order payment status
 */
export const updateOrderPaymentStatusAdmin = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderPaymentStatusAdmin(
      req.params.id,
      req.body.paymentStatus
    );
    return res.status(200).json({
      success: true,
      message: `Order payment status updated to ${order.paymentStatus}`,
      data: { order },
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  createOrder,
  getUserOrders,
  getUserOrderById,
  cancelCustomerOrder,
  getAllOrdersAdmin,
  getOrderByIdAdmin,
  updateOrderStatusAdmin,
  updateOrderPaymentStatusAdmin,
};
