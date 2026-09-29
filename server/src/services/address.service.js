import prisma from "../lib/prisma.js";
import { ApiError } from "../utils/apiError.js";

/**
 * Get all addresses for a specific user
 */
export const getUserAddresses = async (userId) => {
  return await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
};

/**
 * Get single address by ID for a specific user
 */
export const getAddressById = async (userId, addressId) => {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  return address;
};

/**
 * Create a new address for a user
 */
export const createAddress = async (userId, data) => {
  return await prisma.$transaction(async (tx) => {
    // If this address is set as default, remove default flag from other addresses
    if (data.isDefault) {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    } else {
      // If user has no existing addresses, make this first one default
      const existingCount = await tx.address.count({ where: { userId } });
      if (existingCount === 0) {
        data.isDefault = true;
      }
    }

    return await tx.address.create({
      data: {
        ...data,
        userId,
      },
    });
  });
};

/**
 * Update an existing address for a user
 */
export const updateAddress = async (userId, addressId, data) => {
  const existingAddress = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!existingAddress) {
    throw new ApiError(404, "Address not found");
  }

  return await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({
        where: { userId, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    return await tx.address.update({
      where: { id: addressId },
      data,
    });
  });
};

/**
 * Delete an address for a user
 */
export const deleteAddress = async (userId, addressId) => {
  const existingAddress = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!existingAddress) {
    throw new ApiError(404, "Address not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.address.delete({
      where: { id: addressId },
    });

    // If the deleted address was default, set another address as default if one exists
    if (existingAddress.isDefault) {
      const remainingAddress = await tx.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      if (remainingAddress) {
        await tx.address.update({
          where: { id: remainingAddress.id },
          data: { isDefault: true },
        });
      }
    }
  });

  return { message: "Address deleted successfully" };
};

/**
 * Set an address as default for a user
 */
export const setDefaultAddress = async (userId, addressId) => {
  const existingAddress = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!existingAddress) {
    throw new ApiError(404, "Address not found");
  }

  return await prisma.$transaction(async (tx) => {
    await tx.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    return await tx.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  });
};

export default {
  getUserAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
