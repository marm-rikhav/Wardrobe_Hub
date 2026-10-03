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
adminCustomerRouter.get("/:id", customerController.getCustomerByIdAdmin);
adminCustomerRouter.put(
  "/:id",
  validate(updateCustomerSchema),
  customerController.updateCustomerAdmin
);
adminCustomerRouter.patch(
  "/:id/status",
  validate(toggleCustomerStatusSchema),
  customerController.toggleCustomerStatusAdmin
);
adminCustomerRouter.delete("/:id", customerController.deleteCustomerAdmin);

adminCustomerRouter.put(
  "/:id/addresses/:addressId",
  validate(updateCustomerAddressSchema),
  customerController.updateCustomerAddressAdmin
);

export default adminCustomerRouter;
