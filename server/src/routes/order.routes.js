import { Router } from "express";
import orderController from "../controllers/order.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { validate } from "../middleware/validate.js";
import {
  createOrderSchema,
  orderIdParamSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
  adminOrderQuerySchema,
} from "../validations/order.validation.js";

// Customer order router mounted at /api/orders
const router = Router();
router.use(requireAuth);

router.post("/", validate(createOrderSchema), orderController.createOrder);
router.get("/", orderController.getUserOrders);
router.get("/:id", orderController.getUserOrderById);
router.patch("/:id/cancel", validate(orderIdParamSchema, "params"), orderController.cancelCustomerOrder);

// Admin order router mounted at /api/admin/orders
export const adminOrderRouter = Router();
adminOrderRouter.use(requireAuth, requireAdmin);

adminOrderRouter.get(
  "/",
  validate(adminOrderQuerySchema, "query"),
  orderController.getAllOrdersAdmin
);

adminOrderRouter.get(
  "/:id",
  validate(orderIdParamSchema, "params"),
  orderController.getOrderByIdAdmin
);

adminOrderRouter.patch(
  "/:id/status",
  validate(orderIdParamSchema, "params"),
  validate(updateOrderStatusSchema, "body"),
  orderController.updateOrderStatusAdmin
);

adminOrderRouter.patch(
  "/:id/payment-status",
  validate(orderIdParamSchema, "params"),
  validate(updatePaymentStatusSchema, "body"),
  orderController.updateOrderPaymentStatusAdmin
);

export default router;
