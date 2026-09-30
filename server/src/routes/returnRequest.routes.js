import { Router } from "express";
import returnRequestController from "../controllers/returnRequest.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { validate } from "../middleware/validate.js";
import {
  createReturnRequestSchema,
  updateReturnRequestStatusSchema,
  returnRequestIdParamSchema,
  adminReturnQuerySchema,
} from "../validations/returnRequest.validation.js";
import { orderIdParamSchema } from "../validations/order.validation.js";

// Customer router mounted at /api/return-requests
export const customerReturnRouter = Router();
customerReturnRouter.use(requireAuth);

customerReturnRouter.post(
  "/:id",
  validate(orderIdParamSchema, "params"),
  validate(createReturnRequestSchema, "body"),
  returnRequestController.createReturnRequest
);

customerReturnRouter.get(
  "/:id",
  validate(orderIdParamSchema, "params"),
  returnRequestController.getReturnRequestByOrderId
);

// Admin router mounted at /api/admin/returns and /api/admin/return-requests
export const adminReturnRouter = Router();
adminReturnRouter.use(requireAuth, requireAdmin);

adminReturnRouter.get(
  "/",
  validate(adminReturnQuerySchema, "query"),
  returnRequestController.getAllReturnRequestsAdmin
);

adminReturnRouter.get(
  "/:id",
  validate(returnRequestIdParamSchema, "params"),
  returnRequestController.getReturnRequestByIdAdmin
);

adminReturnRouter.patch(
  "/:id",
  validate(returnRequestIdParamSchema, "params"),
  validate(updateReturnRequestStatusSchema, "body"),
  returnRequestController.updateReturnRequestStatusAdmin
);

export default {
  customerReturnRouter,
  adminReturnRouter,
};
