import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";
import { updateProfileSchema } from "../validations/user.validation.js";

const router = Router();

// Public routes
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.logout);

// Protected routes (Requires valid JWT access token)
router.get("/me", requireAuth, authController.getCurrentUser);
router.put("/me", requireAuth, validate(updateProfileSchema), authController.updateProfile);
router.patch("/me", requireAuth, validate(updateProfileSchema), authController.updateProfile);

// Admin-only test/verification route
router.get("/admin-check", requireAuth, requireAdmin, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin access verified successfully",
    data: {
      user: req.user,
    },
  });
});

export default router;
