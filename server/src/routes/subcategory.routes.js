import { Router } from "express";
import subcategoryController from "../controllers/subcategory.controller.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import {
  createSubcategorySchema,
  updateSubcategorySchema,
} from "../validations/subcategory.validation.js";

// Public subcategory routes mounted at /api/subcategories
export const publicSubcategoryRouter = Router();
publicSubcategoryRouter.get("/", subcategoryController.getActiveSubcategoriesPublic);
publicSubcategoryRouter.get("/:idOrSlug", subcategoryController.getSubcategoryBySlugOrIdPublic);

// Admin subcategory routes mounted at /api/admin/subcategories
export const adminSubcategoryRouter = Router();
adminCategoryCheck: adminSubcategoryRouter.use(requireAuth, requireAdmin);

adminSubcategoryRouter.post(
  "/",
  validate(createSubcategorySchema),
  subcategoryController.createSubcategory
);
adminSubcategoryRouter.get("/", subcategoryController.getAllSubcategoriesAdmin);
adminSubcategoryRouter.get("/:id", subcategoryController.getSubcategoryByIdAdmin);
adminSubcategoryRouter.put(
  "/:id",
  validate(updateSubcategorySchema),
  subcategoryController.updateSubcategory
);
adminSubcategoryRouter.delete("/:id", subcategoryController.deleteSubcategory);

export default {
  publicSubcategoryRouter,
  adminSubcategoryRouter,
};
