import productService from "../services/product.service.js";
import { ApiError } from "../utils/apiError.js";

/**
 * Admin: Create product with variants
 */
export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    return res.status(201).json({
      success: true,
      message: "Product and variants created successfully",
      data: { product },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: List all products
 */
export const getAllProductsAdmin = async (req, res, next) => {
  try {
    const { products, pagination } = await productService.getAllProductsAdmin(req.query);
    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: { products, pagination },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: Get product by ID
 */
export const getProductByIdAdmin = async (req, res, next) => {
  try {
    const product = await productService.getProductByIdAdmin(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: { product },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: Update product and/or variants
 */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: { product },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: Permanently delete product
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await productService.deleteProduct(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Product permanently deleted successfully",
      data: { product },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: Upload image for product
 */
export const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, "Image file is required. Please attach an image field");
    }

    const { color, sortOrder } = req.body;
    const image = await productService.uploadProductImage(
      req.params.productId,
      req.file.buffer,
      { color, sortOrder }
    );

    return res.status(201).json({
      success: true,
      message: "Product image uploaded successfully",
      data: { image },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: Delete product image
 */
export const deleteProductImage = async (req, res, next) => {
  try {
    const result = await productService.deleteProductImage(
      req.params.productId,
      req.params.imageId
    );
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Public: List active products with search, filters, pagination
 */
export const getPublicProducts = async (req, res, next) => {
  try {
    const { products, pagination } = await productService.getPublicProducts(req.query);
    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: { products, pagination },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Public: Get product by slug
 */
export const getPublicProductBySlug = async (req, res, next) => {
  try {
    const product = await productService.getPublicProductBySlug(req.params.slug);
    return res.status(200).json({
      success: true,
      message: "Product details fetched successfully",
      data: { product },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: Update variant stock
 */
export const updateVariantStock = async (req, res, next) => {
  try {
    const { productId, variantId } = req.params;
    const { stock } = req.body;
    const variant = await productService.updateVariantStock(productId, variantId, stock);
    return res.status(200).json({
      success: true,
      message: "Variant stock updated successfully",
      data: { variant },
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  createProduct,
  getAllProductsAdmin,
  getProductByIdAdmin,
  updateProduct,
  deleteProduct,
  updateVariantStock,
  uploadProductImage,
  deleteProductImage,
  getPublicProducts,
  getPublicProductBySlug,
};
