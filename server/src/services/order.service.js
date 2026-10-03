import crypto from "node:crypto";
import prisma from "../lib/prisma.js";
import { ApiError } from "../utils/apiError.js";
import {
  sendOrderConfirmedEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail,
} from "./email.service.js";


export const ORDER_STATUS_VALUES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

export const VALID_STATUS_TRANSITIONS = {
  PENDING: ["CONFIRMED", "SHIPPED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED"],
  CANCELLED: [],
  RETURNED: [],
};

const orderIncludeOptions = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
  items: {
    include: {
      variant: {
        include: {
          product: {
            include: {
              images: {
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      },
    },
  },
  payments: {
    orderBy: { createdAt: "desc" },
  },
  returnRequests: {
    orderBy: { createdAt: "desc" },
  },
};

const adminOrderIncludeOptions = orderIncludeOptions;

/**
 * Format raw Prisma order for frontend consumption, preserving historical snapshots
 */
export const formatOrder = (order) => {
  if (!order) return null;

  const items = (order.items || []).map((item) => {
    const images = item.variant?.product?.images || [];
    const matchedImg = images.find(
      (img) => img.color && item.color && img.color.toLowerCase() === item.color.toLowerCase()
    ) || images[0];

    const unitPrice = Number(item.unitPrice);
    const subtotal = Math.round(unitPrice * item.quantity * 100) / 100;

    return {
      id: item.id,
      orderId: item.orderId,
      variantId: item.variantId,
      productName: item.productName,
      size: item.size,
      color: item.color,
      unitPrice,
      quantity: item.quantity,
      subtotal,
      imageUrl: matchedImg?.imageUrl || null,
      sku: item.variant?.sku || null,
    };
  });

  const payments = (order.payments || []).map((p) => ({
    id: p.id,
    orderId: p.orderId,
    gateway: p.gateway,
    gatewayTxnId: p.gatewayTxnId,
    amount: Number(p.amount),
    status: p.status,
    createdAt: p.createdAt,
  }));

  const returnRequests = (order.returnRequests || []).map((req) => ({
    id: req.id,
    orderId: req.orderId,
    type: req.type,
    reason: req.reason,
    details: req.details || null,
    status: req.status,
    adminResponse: req.adminResponse || null,
    createdAt: req.createdAt,
    updatedAt: req.updatedAt,
  }));

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    subtotal: Number(order.subtotal),
    shippingFee: Number(order.shippingFee),
    total: Number(order.total),
    createdAt: order.createdAt,
    shippingAddress: {
      name: order.shipName,
      phone: order.shipPhone,
      address: order.shipAddress,
      city: order.shipCity,
      state: order.shipState,
      postalCode: order.shipPostalCode,
      country: order.shipCountry,
    },
    customer: order.user
      ? {
          id: order.user.id,
          name: order.user.name,
          email: order.user.email,
          phone: order.user.phone,
        }
      : null,
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    payments,
    returnRequests,
  };
};


/**
 * Create a new customer order atomically using prisma.$transaction.
 * Enforces stock safety, snapshot preservation, price revalidation, and cart clearing.
 */
export const createOrder = async (userId, { addressId, paymentMethod }) => {
  if (!paymentMethod || paymentMethod.trim().toUpperCase() !== "COD") {
    throw new ApiError(400, "Invalid payment method. Only Cash on Delivery (COD) is supported.");
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Get customer's cart
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    // 2. Verify cart is not empty
    if (!cart?.items?.length) {
      throw new ApiError(400, "Your cart is empty. Please add items before placing an order");
    }

    // 3, 4, 5, 6. Verify products, variants, and stock availability
    for (const item of cart.items) {
      const variant = item.variant;
      if (!variant?.isActive) {
        throw new ApiError(
          400,
          `The variant "${variant?.sku || "item"}" is no longer active or available`
        );
      }

      if (!variant.product?.isActive) {
        throw new ApiError(
          400,
          `The product "${variant.product?.name || "item"}" is no longer active`
        );
      }

      const currentVariant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
      });

      if (!currentVariant || currentVariant.stock < item.quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for "${variant.product.name}" (${variant.size} / ${variant.color}). Available: ${currentVariant?.stock ?? 0}, Requested: ${item.quantity}`
        );
      }
    }

    // 7. Load and verify selected customer address ownership
    const address = await tx.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new ApiError(404, "Selected delivery address not found or does not belong to your account");
    }

    // 8. Calculate order total and item snapshots using current DB prices
    let subtotal = 0;
    const orderItemsData = cart.items.map((item) => {
      const variant = item.variant;
      const product = variant.product;

      const base = Number(product.basePrice);
      const discount = product.discountPrice == null ? null : Number(product.discountPrice);
      const customPrice = variant.price == null ? null : Number(variant.price);
      const unitPrice = customPrice ?? (discount ?? base);

      const itemTotal = Math.round(unitPrice * item.quantity * 100) / 100;
      subtotal += itemTotal;

      return {
        variantId: item.variantId,
        productName: product.name,
        size: variant.size,
        color: variant.color,
        unitPrice,
        quantity: item.quantity,
      };
    });

    subtotal = Math.round(subtotal * 100) / 100;
    const shippingFee = 0;
    const total = Math.round((subtotal + shippingFee) * 100) / 100;

    // 9. Generate unique orderNumber using CSPRNG
    const orderNumber = `WH-${Date.now().toString(36).toUpperCase()}-${crypto.randomInt(1000, 10000)}`;

    // 10 & 11. Create order with address snapshot and item snapshots
    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        shipName: address.name,
        shipPhone: address.phone,
        shipAddress: address.address,
        shipCity: address.city,
        shipState: address.state,
        shipPostalCode: address.postalCode,
        shipCountry: address.country || "India",
        subtotal,
        shippingFee,
        total,
        status: "PENDING",
        paymentStatus: "PENDING",
        paymentMethod: "COD",
        items: {
          create: orderItemsData,
        },
      },
    });

    // 12. Create COD payment record in payments table
    await tx.payment.create({
      data: {
        orderId: order.id,
        gateway: "COD",
        gatewayTxnId: null,
        amount: total,
        status: "PENDING",
      },
    });

    // 13. Safely reduce stock for every variant using conditional atomic decrement
    for (const item of cart.items) {
      const reduction = await tx.productVariant.updateMany({
        where: {
          id: item.variantId,
          stock: { gte: item.quantity },
        },
        data: {
          stock: { decrement: item.quantity },
        },
      });

      if (reduction.count === 0) {
        throw new ApiError(
          400,
          `Failed to reserve stock for "${item.variant.product.name}" (${item.variant.size} / ${item.variant.color}). Available inventory was claimed by another customer.`
        );
      }
    }

    // 14. Clear customer cart
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // 15. Return the newly created order
    const createdOrder = await tx.order.findUnique({
      where: { id: order.id },
      include: orderIncludeOptions,
    });

    const formatted = formatOrder(createdOrder);
    sendOrderConfirmedEmail(formatted, formatted.customer?.email).catch((err) => {
      console.error("[EmailService] Error dispatching order confirmation email:", err?.message || err);
    });

    return formatted;
  });

};

/**
 * Fetch all orders belonging to authenticated customer
 */
export const getUserOrders = async (userId) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: orderIncludeOptions,
  });

  return orders.map(formatOrder);
};

/**
 * Fetch a single order by ID belonging to authenticated customer
 */
export const getUserOrderById = async (userId, orderId) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: orderIncludeOptions,
  });

  if (!order) {
    throw new ApiError(404, "Order not found or you do not have permission to view it");
  }

  return formatOrder(order);
};

/**
 * Admin: Fetch orders with optional status filter and pagination
 */
export const getAllOrdersAdmin = async ({ status, page, limit }) => {
  const where = {};
  if (status && status !== "ALL") {
    const upperStatus = status.toUpperCase();
    if (!ORDER_STATUS_VALUES.includes(upperStatus)) {
      throw new ApiError(400, `Invalid order status "${status}". Allowed values: ${ORDER_STATUS_VALUES.join(", ")}`);
    }
    where.status = upperStatus;
  }

  const numericPage = page ? Number(page) : undefined;
  const numericLimit = limit ? Number(limit) : undefined;
  const skip = numericPage && numericLimit ? (numericPage - 1) * numericLimit : undefined;
  const take = numericLimit;

  const total = await prisma.order.count({ where });
  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip,
    take,
    include: adminOrderIncludeOptions,
  });

  return {
    orders: orders.map(formatOrder),
    pagination: {
      total,
      page: numericPage || 1,
      limit: numericLimit || total,
      totalPages: numericLimit ? Math.ceil(total / numericLimit) : 1,
    },
  };
};

/**
 * Admin: Fetch single order by ID
 */
export const getOrderByIdAdmin = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: adminOrderIncludeOptions,
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return formatOrder(order);
};

/**
 * Shared cancellation transaction:
 * - Checks that order exists (and belongs to user if userId is provided)
 * - Checks that order is not already CANCELLED
 * - Checks that order is in a cancellable status (PENDING or CONFIRMED)
 * - Atomically and safely restores inventory stock for each variant using stored order-item snapshot
 * - Updates order status to CANCELLED and paymentStatus to CANCELLED
 * - Updates payment record status to CANCELLED
 * - Returns formatted order
 */
const cancelOrderInternal = async (tx, orderId, userId = null) => {
  const where = userId ? { id: orderId, userId } : { id: orderId };
  const existingOrder = await tx.order.findFirst({
    where,
    include: {
      items: true,
      payments: true,
    },
  });

  if (!existingOrder) {
    throw new ApiError(
      404,
      userId ? "Order not found or you do not have permission to view it" : "Order not found"
    );
  }

  if (existingOrder.status === "CANCELLED") {
    throw new ApiError(400, "Order is already cancelled");
  }

  const cancellableStatuses = ["PENDING", "CONFIRMED"];
  if (!cancellableStatuses.includes(existingOrder.status)) {
    throw new ApiError(
      400,
      `Cannot cancel order in status "${existingOrder.status}". Only PENDING or CONFIRMED orders can be cancelled.`
    );
  }

  // Restore inventory stock for each variant using stored order-item snapshot
  for (const item of existingOrder.items) {
    await tx.productVariant.update({
      where: { id: item.variantId },
      data: {
        stock: { increment: item.quantity },
      },
    });
  }

  // Update order status and payment status
  const updatedOrder = await tx.order.update({
    where: { id: orderId },
    data: {
      status: "CANCELLED",
      paymentStatus: "CANCELLED",
    },
    include: userId ? orderIncludeOptions : adminOrderIncludeOptions,
  });

  // Update payment records
  await tx.payment.updateMany({
    where: {
      orderId,
      status: { in: ["PENDING", "UNPAID"] },
    },
    data: {
      status: "CANCELLED",
    },
  });

  const formatted = formatOrder(updatedOrder);
  sendOrderCancelledEmail(formatted, formatted.customer?.email).catch((err) => {
    console.error("[EmailService] Error dispatching order cancellation email:", err?.message || err);
  });

  return formatted;
};


/**
 * Customer: Cancel own order and restore inventory stock safely
 */
export const cancelCustomerOrder = async (userId, orderId) => {
  return await prisma.$transaction(async (tx) => {
    return cancelOrderInternal(tx, orderId, userId);
  });
};

/**
 * Admin: Update order status with transition validation
 * When transitioned to CANCELLED, stock is safely restored
 */
export const updateOrderStatusAdmin = async (orderId, newStatus) => {
  const upperStatus = (newStatus || "").toUpperCase();

  if (!ORDER_STATUS_VALUES.includes(upperStatus)) {
    throw new ApiError(
      400,
      `Invalid order status value "${newStatus}". Allowed values: ${ORDER_STATUS_VALUES.join(", ")}`
    );
  }

  // If transitioning to CANCELLED, execute atomic cancellation and stock restoration
  if (upperStatus === "CANCELLED") {
    return await prisma.$transaction(async (tx) => {
      return cancelOrderInternal(tx, orderId, null);
    });
  }

  return await prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      throw new ApiError(404, "Order not found");
    }

    const currentStatus = existingOrder.status;

    // Validate state transition rule
    const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowedTransitions.includes(upperStatus)) {
      throw new ApiError(
        400,
        `Cannot transition order status from "${currentStatus}" to "${upperStatus}". Allowed transitions: ${
          allowedTransitions.length > 0 ? allowedTransitions.join(", ") : "None (terminal status)"
        }`
      );
    }

    // Automatically mark COD orders as PAID when transitioning to DELIVERED
    const isCodDelivered = upperStatus === "DELIVERED" && existingOrder.paymentMethod === "COD";
    const updateData = { status: upperStatus };

    if (isCodDelivered) {
      updateData.paymentStatus = "PAID";
    }

    await tx.order.update({
      where: { id: orderId },
      data: updateData,
    });

    if (isCodDelivered) {
      await tx.payment.updateMany({
        where: {
          orderId,
          status: { in: ["PENDING", "UNPAID"] },
        },
        data: {
          status: "PAID",
        },
      });
    }

    const updatedOrder = await tx.order.findUnique({
      where: { id: orderId },
      include: adminOrderIncludeOptions,
    });

    const formatted = formatOrder(updatedOrder);
    const customerEmail = formatted.customer?.email;

    if (upperStatus === "CONFIRMED") {
      sendOrderConfirmedEmail(formatted, customerEmail).catch((err) => {
        console.error("[EmailService] Error dispatching order confirmation email:", err?.message || err);
      });
    } else if (upperStatus === "SHIPPED") {
      sendOrderShippedEmail(formatted, customerEmail).catch((err) => {
        console.error("[EmailService] Error dispatching order shipped email:", err?.message || err);
      });
    } else if (upperStatus === "DELIVERED") {
      sendOrderDeliveredEmail(formatted, customerEmail).catch((err) => {
        console.error("[EmailService] Error dispatching order delivered email:", err?.message || err);
      });
    }

    return formatted;
  });

};

/**
 * Admin: Update payment status (e.g. mark COD as PAID upon collection)
 */
export const updateOrderPaymentStatusAdmin = async (orderId, newPaymentStatus) => {
  const upperPaymentStatus = (newPaymentStatus || "").toUpperCase();
  const validPaymentStatuses = ["PAID", "CANCELLED", "REFUNDED", "FAILED"];

  if (!validPaymentStatuses.includes(upperPaymentStatus)) {
    throw new ApiError(
      400,
      `Invalid payment status "${newPaymentStatus}". Allowed values: ${validPaymentStatuses.join(", ")}`
    );
  }

  return await prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!existingOrder) {
      throw new ApiError(404, "Order not found");
    }

    if (existingOrder.status === "CANCELLED" && upperPaymentStatus === "PAID") {
      throw new ApiError(400, "Cannot mark payment as PAID for a cancelled order");
    }

    if (existingOrder.paymentStatus === "CANCELLED" && upperPaymentStatus === "PAID") {
      throw new ApiError(400, "Cannot mark payment as PAID for a cancelled payment");
    }

    if (existingOrder.paymentStatus === "PAID" && upperPaymentStatus === "PAID") {
      const refreshed = await tx.order.findUnique({
        where: { id: orderId },
        include: adminOrderIncludeOptions,
      });
      return formatOrder(refreshed);
    }

    if (existingOrder.paymentStatus === "PAID" && upperPaymentStatus !== "REFUNDED") {
      throw new ApiError(
        400,
        `Cannot change payment status from PAID to ${upperPaymentStatus}. Only refund is permitted.`
      );
    }

    await tx.order.update({
      where: { id: orderId },
      data: { paymentStatus: upperPaymentStatus },
    });

    await tx.payment.updateMany({
      where: { orderId },
      data: { status: upperPaymentStatus },
    });

    const updatedOrder = await tx.order.findUnique({
      where: { id: orderId },
      include: adminOrderIncludeOptions,
    });

    return formatOrder(updatedOrder);
  });
};

export default {
  createOrder,
  getUserOrders,
  getUserOrderById,
  cancelCustomerOrder,
  formatOrder,
  getAllOrdersAdmin,
  getOrderByIdAdmin,
  updateOrderStatusAdmin,
  updateOrderPaymentStatusAdmin,
  ORDER_STATUS_VALUES,
  VALID_STATUS_TRANSITIONS,
};
