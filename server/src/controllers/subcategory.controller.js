import subcategoryService from "../services/subcategory.service.js";

/**
 * Admin: Create subcategory
 */
export const createSubcategory = async (req, res, next) => {
  try {
    const subcategory = await subcategoryService.createSubcategory(req.body);
    return res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
      data: { subcategory },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: List all subcategories
 */
export const getAllSubcategoriesAdmin = async (req, res, next) => {
  try {
    const subcategories = await subcategoryService.getAllSubcategoriesAdmin(req.query.categoryId);
    return res.status(200).json({
      success: true,
      message: "Subcategories fetched successfully",
      data: { subcategories },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: Get subcategory by ID
 */
export const getSubcategoryByIdAdmin = async (req, res, next) => {
  try {
    const subcategory = await subcategoryService.getSubcategoryByIdAdmin(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Subcategory fetched successfully",
      data: { subcategory },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: Update subcategory
 */
export const updateSubcategory = async (req, res, next) => {
  try {
    const subcategory = await subcategoryService.updateSubcategory(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      data: { subcategory },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: Soft delete subcategory
 */
export const deleteSubcategory = async (req, res, next) => {
  try {
    const subcategory = await subcategoryService.deleteSubcategory(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Subcategory deactivated successfully",
      data: { subcategory },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Public: List active subcategories
 */
export const getActiveSubcategoriesPublic = async (req, res, next) => {
  try {
    const subcategories = await subcategoryService.getActiveSubcategoriesPublic(req.query.category);
    return res.status(200).json({
      success: true,
      message: "Active subcategories fetched successfully",
      data: { subcategories },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Public: Get active subcategory by ID or slug
 */
export const getSubcategoryBySlugOrIdPublic = async (req, res, next) => {
  try {
    const subcategory = await subcategoryService.getSubcategoryBySlugOrIdPublic(req.params.idOrSlug);
    return res.status(200).json({
      success: true,
      message: "Subcategory details fetched successfully",
      data: { subcategory },
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  createSubcategory,
  getAllSubcategoriesAdmin,
  getSubcategoryByIdAdmin,
  updateSubcategory,
  deleteSubcategory,
  getActiveSubcategoriesPublic,
  getSubcategoryBySlugOrIdPublic,
};
