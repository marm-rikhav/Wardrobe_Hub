import prisma from "../lib/prisma.js";
import { ApiError } from "../utils/apiError.js";

/**
 * Format a raw Prisma cart record with all computed storefront fields:
 * effective price, item subtotal, matching image, cart subtotal, total items.
 */
export const formatCart = (cart) => {
  if (!cart) {
    return {
      id: null,
      items: [],
      subtotal: 0,
      totalItems: 0,
    };
  }

  const items = (cart.items || []).map((item) => {
    const variant = item.variant;
    const product = variant?.product;

    // Price calculation: variant custom price takes precedence over product discount / base price
    const base = product?.basePrice == null ? 0 : Number(product.basePrice);
    const discount = product?.discountPrice == null ? null : Number(product.discountPrice);
    const variantCustom = variant?.price == null ? null : Number(variant.price);
    const effectivePrice = variantCustom ?? (discount ?? base);

    // Pick best matching image for the variant's color, or fall back to first image
    const images = product?.images || [];
    const matchedImg = images.find(
      (img) => img.color && variant?.color && img.color.toLowerCase() === variant.color.toLowerCase()
    ) || images[0];
    const imageUrl = matchedImg ? matchedImg.imageUrl : null;

    const quantity = item.quantity;
    const itemSubtotal = Math.round(effectivePrice * quantity * 100) / 100;

    return {
      id: item.id,
      cartId: item.cartId,
      variantId: variant?.id,
      productId: product?.id,
      productName: product?.name || "",
      productSlug: product?.slug || "",
      size: variant?.size || "",
      color: variant?.color || "",
      sku: variant?.sku || "",
      price: effectivePrice,
      quantity,
      stock: variant?.stock ?? 0,
      isActive: Boolean(variant?.isActive && product?.isActive),
      imageUrl,
      subtotal: itemSubtotal,
    };
  });

  const subtotal = Math.round(items.reduce((sum, it) => sum + it.subtotal, 0) * 100) / 100;
  const totalItems = items.reduce((sum, it) => sum + it.quantity, 0);

  return {
    id: cart.id,
    items,
    subtotal,
    totalItems,
  };
};

/**
 * Common query options to include deep variant and product data for a cart
 */
const cartIncludeOptions = {
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
    orderBy: { id: "asc" },
  },
};

/**
 * Get or create cart for a customer
 */
export const getOrCreateCart = async (userId, tx = prisma) => {
  let cart = await tx.cart.findUnique({
    where: { userId },
    include: cartIncludeOptions,
  });

  if (!cart) {
    cart = await tx.cart.create({
      data: { userId },
      include: cartIncludeOptions,
    });
  }

  return cart;
};

/**
 * Get current customer cart
 */
export const getCart = async (userId) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: cartIncludeOptions,
  });

  return formatCart(cart);
};

/**
 * Add an item to customer's cart
 */
export const addItemToCart = async (userId, { variantId, quantity = 1 }) => {
  // 1. Validate variant existence and status
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: true },
  });

  if (!variant?.isActive) {
    throw new ApiError(404, "Product variant not found or is currently inactive");
  }

  if (!variant.product?.isActive) {
    throw new ApiError(400, "Product is currently inactive");
  }

  if (variant.stock <= 0) {
    throw new ApiError(400, "This product variant is currently out of stock");
  }

  return await prisma.$transaction(async (tx) => {
    // 2. Ensure customer cart exists
    const cart = await getOrCreateCart(userId, tx);

    // 3. Check if this variant is already in the cart
    const existingItem = await tx.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId,
        },
      },
    });

    const targetQuantity = existingItem ? existingItem.quantity + quantity : quantity;

    if (targetQuantity > variant.stock) {
      throw new ApiError(
        400,
        `Cannot add ${quantity} item(s). Requested total quantity (${targetQuantity}) exceeds available stock (${variant.stock})`
      );
    }

    if (existingItem) {
      await tx.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: targetQuantity },
      });
    } else {
      await tx.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity,
        },
      });
    }

    // Return the updated cart
    const updatedCart = await tx.cart.findUnique({
      where: { id: cart.id },
      include: cartIncludeOptions,
    });

    return formatCart(updatedCart);
  });
};

/**
 * Update an item quantity in customer's cart
 */
export const updateCartItemQuantity = async (userId, itemId, quantity) => {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: {
      cart: true,
      variant: {
        include: { product: true },
      },
    },
  });

  if (!cartItem || cartItem.cart.userId !== userId) {
    throw new ApiError(404, "Cart item not found");
  }

  const { variant } = cartItem;

  if (!variant.isActive || !variant.product?.isActive) {
    throw new ApiError(400, "This product variant is no longer available");
  }

  if (quantity > variant.stock) {
    throw new ApiError(
      400,
      `Requested quantity (${quantity}) exceeds available stock (${variant.stock})`
    );
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });

  return await getCart(userId);
};

/**
 * Remove an item from customer's cart
 */
export const removeCartItem = async (userId, itemId) => {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });

  if (!cartItem || cartItem.cart.userId !== userId) {
    throw new ApiError(404, "Cart item not found");
  }

  await prisma.cartItem.delete({
    where: { id: itemId },
  });

  return await getCart(userId);
};

/**
 * Clear all items from customer's cart
 */
export const clearCart = async (userId, tx = prisma) => {
  const cart = await tx.cart.findUnique({
    where: { userId },
  });

  if (cart) {
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }

  return { success: true, message: "Cart cleared successfully" };
};

export default {
  getCart,
  getOrCreateCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  formatCart,
};
