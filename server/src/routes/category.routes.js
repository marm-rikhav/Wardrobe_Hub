import { Router } from "express";
import categoryController from "../controllers/category.controller.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validations/category.validation.js";

// Public category routes mounted at /api/categories
export const publicCategoryRouter = Router();
publicCategoryRouter.get("/", categoryController.getActiveCategoriesPublic);
publicCategoryRouter.get("/:idOrSlug", categoryController.getCategoryBySlugOrIdPublic);

// Admin category routes mounted at /api/admin/categories
export const adminCategoryRouter = Router();
adminCategoryRouter.use(requireAuth, requireAdmin);

adminCategoryRouter.post(
  "/",
  validate(createCategorySchema),
  categoryController.createCategory
);
adminCategoryRouter.get("/", categoryController.getAllCategoriesAdmin);
adminCategoryRouter.get("/:id", categoryController.getCategoryByIdAdmin);
adminCategoryRouter.put(
  "/:id",
  validate(updateCategorySchema),
  categoryController.updateCategory
);
adminCategoryRouter.delete("/:id", categoryController.deleteCategory);

export default {
  publicCategoryRouter,
  adminCategoryRouter,
};
