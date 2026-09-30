import orderService from "../services/order.service.js";

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

export default {
  createOrder,
  getUserOrders,
  getUserOrderById,
};
