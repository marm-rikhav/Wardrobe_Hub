import { Router } from "express";
import productController from "../controllers/product.controller.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { upload } from "../middleware/upload.js";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  uploadImageBodySchema,
  updateStockSchema,
} from "../validations/product.validation.js";

// Public product routes mounted at /api/products
export const publicProductRouter = Router();
publicProductRouter.get("/", validate(productQuerySchema, "query"), productController.getPublicProducts);
publicProductRouter.get("/:slug", productController.getPublicProductBySlug);

// Admin product routes mounted at /api/admin/products
export const adminProductRouter = Router();
adminProductRouter.use(requireAuth, requireAdmin);

adminProductRouter.post(
  "/",
  validate(createProductSchema),
  productController.createProduct
);
adminProductRouter.get("/", productController.getAllProductsAdmin);
adminProductRouter.get("/:id", productController.getProductByIdAdmin);
adminProductRouter.put(
  "/:id",
  validate(updateProductSchema),
  productController.updateProduct
);
adminProductRouter.delete("/:id", productController.deleteProduct);

// Variant stock management route
adminProductRouter.patch(
  "/:productId/variants/:variantId/stock",
  validate(updateStockSchema),
  productController.updateVariantStock
);

// Image management routes
adminProductRouter.post(
  ["/:productId/images", "/:productId/images/upload"],
  upload.single("image"),
  validate(uploadImageBodySchema),
  productController.uploadProductImage
);
adminProductRouter.delete(
  "/:productId/images/:imageId",
  productController.deleteProductImage
);

export default {
  publicProductRouter,
  adminProductRouter,
};
