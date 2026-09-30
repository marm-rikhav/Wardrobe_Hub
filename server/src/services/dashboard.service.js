import prisma from "../lib/prisma.js";
import { formatOrder } from "./order.service.js";

/**
 * Admin: Fetch aggregated dashboard statistics including:
 * - Total orders count
 * - Total revenue aggregate (non-cancelled orders)
 * - Low-stock products & variants (stock <= 5)
 * - Recent orders (latest 5 orders)
 * - Total customer count
 *
 * Uses sequential async/await execution to maintain clean query flow on pg connection sockets.
 */
export const getDashboardStats = async () => {
  // 1. Total orders count
  const totalOrders = await prisma.order.count();

  // 2. Total revenue sum across non-cancelled orders
  const revenueAggregate = await prisma.order.aggregate({
    _sum: { total: true },
    where: {
      status: { not: "CANCELLED" },
    },
  });

  // 3. Low-stock variants with product details
  const lowStockVariantsRaw = await prisma.productVariant.findMany({
    where: {
      stock: { lte: 5 },
      isActive: true,
      product: { isActive: true },
    },
    take: 20,
    orderBy: { stock: "asc" },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: {
            take: 1,
            orderBy: { sortOrder: "asc" },
            select: { imageUrl: true },
          },
        },
      },
    },
  });

  // 4. Low-stock total count
  const lowStockCount = await prisma.productVariant.count({
    where: {
      stock: { lte: 5 },
      isActive: true,
      product: { isActive: true },
    },
  });

  // 5. Recent 5 orders with related customer & items
  const recentOrdersRaw = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
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
                  images: { orderBy: { sortOrder: "asc" } },
                },
              },
            },
          },
        },
      },
      payments: { orderBy: { createdAt: "desc" } },
      returnRequests: { orderBy: { createdAt: "desc" } },
    },
  });

  // 6. Total active customers
  const totalCustomers = await prisma.user.count({
    where: { role: "CUSTOMER" },
  });

  const totalRevenue = Number(revenueAggregate._sum.total || 0);

  const lowStockVariants = lowStockVariantsRaw.map((v) => ({
    id: v.id,
    productId: v.productId,
    productName: v.product?.name || "Unknown Product",
    sku: v.sku,
    size: v.size,
    color: v.color,
    stock: v.stock,
    price: Number(v.price || 0),
    imageUrl: v.product?.images?.[0]?.imageUrl || null,
  }));

  const recentOrders = recentOrdersRaw.map(formatOrder);

  return {
    totalOrders,
    totalRevenue,
    lowStockCount,
    totalCustomers,
    lowStockVariants,
    recentOrders,
  };
};

export default {
  getDashboardStats,
};
