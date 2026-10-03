import { Router } from "express";
import customerController from "../controllers/customer.controller.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import {
  updateCustomerSchema,
  toggleCustomerStatusSchema,
  updateCustomerAddressSchema,
  createCustomerAdminSchema,
  customerIdParamSchema,
  customerAddressParamsSchema,
} from "../validations/customer.validation.js";

const adminCustomerRouter = Router();

// Enforce admin authentication for all customer management routes
adminCustomerRouter.use(requireAuth, requireAdmin);

adminCustomerRouter.get("/", customerController.getAllCustomersAdmin);
adminCustomerRouter.post(
  "/",
  validate(createCustomerAdminSchema),
  customerController.createCustomerAdmin
);
adminCustomerRouter.get(
  "/:id",
  validate(customerIdParamSchema, "params"),
  customerController.getCustomerByIdAdmin
);
adminCustomerRouter.put(
  "/:id",
  validate(customerIdParamSchema, "params"),
  validate(updateCustomerSchema),
  customerController.updateCustomerAdmin
);
adminCustomerRouter.patch(
  "/:id/status",
  validate(customerIdParamSchema, "params"),
  validate(toggleCustomerStatusSchema),
  customerController.toggleCustomerStatusAdmin
);
adminCustomerRouter.delete(
  "/:id",
  validate(customerIdParamSchema, "params"),
  customerController.deleteCustomerAdmin
);

adminCustomerRouter.put(
  "/:id/addresses/:addressId",
  validate(customerAddressParamsSchema, "params"),
  validate(updateCustomerAddressSchema),
  customerController.updateCustomerAddressAdmin
);

export default adminCustomerRouter;
