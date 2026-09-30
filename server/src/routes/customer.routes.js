import { Router } from "express";
import customerController from "../controllers/customer.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const adminCustomerRouter = Router();

// Enforce admin authentication for all customer management routes
adminCustomerRouter.use(requireAuth, requireAdmin);

adminCustomerRouter.get("/", customerController.getAllCustomersAdmin);

export default adminCustomerRouter;
