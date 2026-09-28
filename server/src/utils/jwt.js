import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "5h";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

/**
 * Generate Access Token with exact 5 hours expiration
 * Payload contains only minimal safe information: userId, role
 */
export const generateAccessToken = (payload) => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured in environment variables");
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Generate Refresh Token
 * Payload contains userId
 */
export const generateRefreshToken = (payload) => {
  if (!JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not configured in environment variables");
  }
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token) => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured in environment variables");
  }
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token) => {
  if (!JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not configured in environment variables");
  }
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
