import { Router } from "express";
import orderController from "../controllers/order.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import { createOrderSchema } from "../validations/order.validation.js";

const router = Router();

// All customer order routes require authentication
router.use(requireAuth);

router.post("/", validate(createOrderSchema), orderController.createOrder);
router.get("/", orderController.getUserOrders);
router.get("/:id", orderController.getUserOrderById);

export default router;
