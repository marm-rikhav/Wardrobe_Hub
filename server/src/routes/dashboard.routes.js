import { Router } from "express";
import dashboardController from "../controllers/dashboard.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const adminDashboardRouter = Router();

// Enforce admin authentication for dashboard routes
adminDashboardRouter.use(requireAuth, requireAdmin);

adminDashboardRouter.get("/stats", dashboardController.getDashboardStats);
adminDashboardRouter.get("/", dashboardController.getDashboardStats);

export default adminDashboardRouter;
