import { Router } from "express";
import cartController from "../controllers/cart.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import {
  addToCartSchema,
  updateCartItemSchema,
} from "../validations/cart.validation.js";

const router = Router();

// All cart routes require authentication
router.use(requireAuth);

router.get("/", cartController.getCart);
router.post("/items", validate(addToCartSchema), cartController.addItemToCart);
router.patch("/items/:itemId", validate(updateCartItemSchema), cartController.updateCartItem);
router.delete("/items/:itemId", cartController.removeCartItem);
router.delete("/", cartController.clearCart);

export default router;
