import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import { ApiError } from "../utils/apiError.js";

const BCRYPT_SALT_ROUNDS = 10;

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

  const total = await prisma.user.count({ where });
  const customers = await prisma.user.findMany({
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
  });

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

/**
 * Admin: Get single customer by ID with full details, addresses, order count, and 5 recent orders.
 */
export const getCustomerByIdAdmin = async (id) => {
  const customer = await prisma.user.findFirst({
    where: { id, role: "CUSTOMER" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      addresses: {
        orderBy: { isDefault: "desc" },
      },
      _count: {
        select: { orders: true },
      },
      orders: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          paymentStatus: true,
          paymentMethod: true,
          createdAt: true,
          _count: {
            select: { items: true },
          },
        },
      },
    },
  });

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    role: customer.role,
    isActive: customer.isActive,
    createdAt: customer.createdAt,
    addresses: customer.addresses || [],
    totalOrders: customer._count?.orders ?? 0,
    recentOrders: (customer.orders || []).map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      total: Number(o.total),
      status: o.status,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt,
      totalItems: o._count?.items ?? 0,
    })),
  };
};

/**
 * Admin: Update customer details (name, email, phone, isActive)
 */
export const updateCustomerAdmin = async (id, updateData) => {
  const existingCustomer = await prisma.user.findFirst({
    where: { id, role: "CUSTOMER" },
  });

  if (!existingCustomer) {
    throw new ApiError(404, "Customer not found");
  }

  if (updateData.email && updateData.email !== existingCustomer.email) {
    const emailConflict = await prisma.user.findFirst({
      where: {
        id: { not: id },
        email: updateData.email,
      },
    });

    if (emailConflict) {
      throw new ApiError(409, "Email is already associated with another account");
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      name: updateData.name || undefined,
      email: updateData.email || undefined,
      phone: updateData.phone !== undefined ? updateData.phone : undefined,
      isActive: updateData.isActive !== undefined ? updateData.isActive : undefined,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return updated;
};

/**
 * Admin: Toggle customer active status
 */
export const toggleCustomerStatusAdmin = async (id, isActive) => {
  const existingCustomer = await prisma.user.findFirst({
    where: { id, role: "CUSTOMER" },
  });

  if (!existingCustomer) {
    throw new ApiError(404, "Customer not found");
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return updated;
};

/**
 * Admin: Permanently delete customer
 */
export const deleteCustomerAdmin = async (id) => {
  const existingCustomer = await prisma.user.findFirst({
    where: { id, role: "CUSTOMER" },
  });

  if (!existingCustomer) {
    throw new ApiError(404, "Customer not found");
  }

  const orderCount = await prisma.order.count({
    where: { userId: id },
  });

  if (orderCount > 0) {
    throw new ApiError(
      400,
      "Cannot delete customer because they have existing order history. Please deactivate their account instead."
    );
  }

  return await prisma.user.delete({
    where: { id },
  });
};

/**
 * Admin: Update an address for a specific customer
 */
export const updateCustomerAddressAdmin = async (customerId, addressId, addressData) => {
  const existingCustomer = await prisma.user.findFirst({
    where: { id: customerId, role: "CUSTOMER" },
  });

  if (!existingCustomer) {
    throw new ApiError(404, "Customer not found");
  }

  const existingAddress = await prisma.address.findFirst({
    where: { id: addressId, userId: customerId },
  });

  if (!existingAddress) {
    throw new ApiError(404, "Address not found for this customer");
  }

  return await prisma.$transaction(async (tx) => {
    if (addressData.isDefault) {
      await tx.address.updateMany({
        where: { userId: customerId, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    return await tx.address.update({
      where: { id: addressId },
      data: {
        name: addressData.name,
        phone: addressData.phone,
        address: addressData.address,
        city: addressData.city,
        state: addressData.state,
        postalCode: addressData.postalCode,
        country: addressData.country || "India",
        isDefault: addressData.isDefault,
      },
    });
  });
};

/**
 * Admin: Create a new customer with address, initialized as DEACTIVATED (isActive: false)
 */
export const createCustomerAdmin = async (customerData) => {
  const { name, email, password, phone, address } = customerData;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  return await prisma.$transaction(async (tx) => {
    // Create user with isActive: false (deactivated on creation per user requirement)
    const newUser = await tx.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        role: "CUSTOMER",
        isActive: false, // strictly deactivated on creation
      },
    });

    // If initial address is provided, create it as the default address
    let newAddress = null;
    if (address && address.address && address.city && address.state && address.postalCode) {
      newAddress = await tx.address.create({
        data: {
          userId: newUser.id,
          name: address.name || name,
          phone: address.phone || phone || "0000000000",
          address: address.address,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country || "India",
          isDefault: true,
        },
      });
    }

    const { passwordHash: _, ...safeUser } = newUser;
    return {
      ...safeUser,
      addresses: newAddress ? [newAddress] : [],
      totalOrders: 0,
      recentOrders: [],
    };
  });
};

export default {
  getAllCustomersAdmin,
  getCustomerByIdAdmin,
  updateCustomerAdmin,
  toggleCustomerStatusAdmin,
  deleteCustomerAdmin,
  updateCustomerAddressAdmin,
  createCustomerAdmin,
};
