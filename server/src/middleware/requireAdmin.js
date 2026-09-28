import { ApiError } from "../utils/apiError.js";

/**
 * Middleware to restrict access to ADMIN users only
 * Must be used AFTER requireAuth middleware
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required"));
  }

  if (req.user.role !== "ADMIN") {
    return next(new ApiError(403, "Forbidden: Admin privileges required to access this resource"));
  }

  return next();
};

export default requireAdmin;
