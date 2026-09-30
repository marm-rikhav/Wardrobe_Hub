import prisma from "../lib/prisma.js";
import { ApiError } from "../utils/apiError.js";

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
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
};

const orderIncludeOptions = {
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
};

/**
 * Create a new customer order atomically using prisma.$transaction.
 * Enforces stock safety, snapshot preservation, price revalidation, and cart clearing.
 */
export const createOrder = async (userId, { addressId }) => {
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
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new ApiError(400, "Your cart is empty. Please add items before placing an order");
    }

    // 3, 4, 5, 6. Verify products, variants, and stock availability
    for (const item of cart.items) {
      const variant = item.variant;
      if (!variant || !variant.isActive) {
        throw new ApiError(
          400,
          `The variant "${variant?.sku || "item"}" is no longer active or available`
        );
      }

      if (!variant.product || !variant.product.isActive) {
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
      const discount = product.discountPrice != null ? Number(product.discountPrice) : null;
      const customPrice = variant.price != null ? Number(variant.price) : null;
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

    // 9. Generate unique orderNumber
    const orderNumber = `WH-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

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
        paymentStatus: "UNPAID",
        paymentMethod: "ONLINE",
        items: {
          create: orderItemsData,
        },
      },
      include: orderIncludeOptions,
    });

    // 12 & 13. Safely reduce stock for every variant using conditional atomic decrement
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
    return formatOrder(order);
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

export default {
  createOrder,
  getUserOrders,
  getUserOrderById,
  formatOrder,
};
