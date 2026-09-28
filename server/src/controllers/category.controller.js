import categoryService from "../services/category.service.js";

/**
 * Admin: Create category
 */
export const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: { category },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: List all categories
 */
export const getAllCategoriesAdmin = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategoriesAdmin();
    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: { categories },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: Get category by ID
 */
export const getCategoryByIdAdmin = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryByIdAdmin(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      data: { category },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: Update category
 */
export const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: { category },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: Soft delete category
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await categoryService.deleteCategory(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Category deactivated successfully",
      data: { category },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Public: List active categories
 */
export const getActiveCategoriesPublic = async (req, res, next) => {
  try {
    const categories = await categoryService.getActiveCategoriesPublic();
    return res.status(200).json({
      success: true,
      message: "Active categories fetched successfully",
      data: { categories },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Public: Get active category by ID or slug
 */
export const getCategoryBySlugOrIdPublic = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryBySlugOrIdPublic(req.params.idOrSlug);
    return res.status(200).json({
      success: true,
      message: "Category details fetched successfully",
      data: { category },
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  createCategory,
  getAllCategoriesAdmin,
  getCategoryByIdAdmin,
  updateCategory,
  deleteCategory,
  getActiveCategoriesPublic,
  getCategoryBySlugOrIdPublic,
};
