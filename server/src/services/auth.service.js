import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import { ApiError } from "../utils/apiError.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

const BCRYPT_SALT_ROUNDS = 10;

/**
 * Helper to format safe user object excluding sensitive fields like passwordHash
 */
const toSafeUser = (user) => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

/**
 * Register a new user
 * Note: Role is strictly forced to CUSTOMER for public registration
 */
export const register = async ({ name, email, password, phone }) => {
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists");
  }

  // Hash password with bcrypt
  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  // Create user with forced CUSTOMER role
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      passwordHash,
      role: "CUSTOMER",
      isActive: true,
    },
  });

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: newUser.id,
    role: newUser.role,
  });

  const refreshToken = generateRefreshToken({
    userId: newUser.id,
  });

  return {
    user: toSafeUser(newUser),
    accessToken,
    refreshToken,
  };
};

/**
 * Login user with email and password
 */
export const login = async ({ email, password }) => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Use generic message to prevent email enumeration
  if (!user?.isActive) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Verify password with bcrypt
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
  });

  return {
    user: toSafeUser(user),
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is missing");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token", [], err);
  }

  // Verify user still exists and is active
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user?.isActive) {
    throw new ApiError(401, "User not found or account deactivated");
  }

  // Issue fresh access token (5h)
  const newAccessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
  });

  return {
    accessToken: newAccessToken,
  };
};

/**
 * Get current user profile by user ID
 */
export const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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

  if (!user?.isActive) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, { name, phone }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.isActive) {
    throw new ApiError(404, "User not found");
  }

  const dataToUpdate = {};
  if (name !== undefined) dataToUpdate.name = name;
  if (phone !== undefined) dataToUpdate.phone = phone;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: dataToUpdate,
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

  return updatedUser;
};

export default {
  register,
  login,
  refreshAccessToken,
  getUserById,
  updateUserProfile,
};
