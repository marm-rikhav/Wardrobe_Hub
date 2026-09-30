import prisma from "../lib/prisma.js";

/**
 * Admin: List customers with search, pagination, and order counts.
 * Strictly selects only safe customer fields, never exposing password hashes or sensitive tokens.
 */
export const getAllCustomersAdmin = async ({ page = 1, limit = 20, search }) => {
  const numericPage = Math.max(1, Number(page) || 1);
  const numericLimit = Math.max(1, Math.min(100, Number(limit) || 20));
  const skip = (numericPage - 1) * numericLimit;

  const where = {
    role: "CUSTOMER",
  };

  if (search?.trim()) {
    const q = search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
    ];
  }

  const [total, customers] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: numericLimit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
    }),
  ]);

  return {
    customers: customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      role: c.role,
      isActive: c.isActive,
      createdAt: c.createdAt,
      totalOrders: c._count?.orders ?? 0,
    })),
    pagination: {
      page: numericPage,
      limit: numericLimit,
      total,
      totalPages: Math.ceil(total / numericLimit) || 1,
    },
  };
};

export default {
  getAllCustomersAdmin,
};
