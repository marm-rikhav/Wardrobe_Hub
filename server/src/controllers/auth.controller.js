import authService from "../services/auth.service.js";
import { ApiError } from "../utils/apiError.js";

const COOKIE_NAME = "refreshToken";

/**
 * Helper to get refresh token cookie options
 */
const getRefreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  path: "/",
});

/**
 * Handle user registration
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const { user, accessToken, refreshToken } = await authService.register({
      name,
      email,
      password,
      phone,
    });

    // Set refresh token in secure HTTP-only cookie
    res.cookie(COOKIE_NAME, refreshToken, getRefreshTokenCookieOptions());

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        accessToken,
        user,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Handle user login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login({
      email,
      password,
    });

    // Set refresh token in secure HTTP-only cookie
    res.cookie(COOKIE_NAME, refreshToken, getRefreshTokenCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        user,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Handle access token refresh
 */
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      throw new ApiError(401, "Refresh token is missing");
    }

    const { accessToken } = await authService.refreshAccessToken(token);

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Handle getting current authenticated user profile
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Current user profile fetched successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Handle updating current user profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await authService.updateUserProfile(req.user.id, { name, phone });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Handle user logout (clear refresh token cookie)
 */
export const logout = async (req, res, next) => {
  try {
    res.clearCookie(COOKIE_NAME, getRefreshTokenCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  register,
  login,
  refreshToken,
  getCurrentUser,
  updateProfile,
  logout,
};
