import { ApiError } from "../utils/apiError.js";
import { verifyAccessToken } from "../utils/jwt.js";

/**
 * Middleware to require and verify JWT access token
 * Attaches decoded user info (id, role) to req.user
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authentication required. Please provide a valid Bearer token"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);

    // Attach authenticated user information to req.user
    req.user = {
      id: decoded.userId,
      role: decoded.role,
    };

    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new ApiError(401, "Access token has expired. Please refresh your token"));
    }
    return next(new ApiError(401, "Invalid access token"));
  }
};

export default requireAuth;
