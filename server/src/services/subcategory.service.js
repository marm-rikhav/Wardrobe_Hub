import prisma from "../lib/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { slugify } from "../utils/slugify.js";

/**
 * Admin: Create subcategory
 */
export const createSubcategory = async ({ categoryId, name, slug, isActive = true }) => {
  // 1. Verify parent category exists and is active
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category || !category.isActive) {
    throw new ApiError(404, "Parent category not found or is currently inactive");
  }

  // 2. Generate slug
  const finalSlug = slug ? slugify(slug) : slugify(name);

  if (!finalSlug) {
    throw new ApiError(400, "Unable to generate a valid slug for this subcategory");
  }

  // 3. Check uniqueness of (categoryId, name) and slug
  const existingSubcategory = await prisma.subcategory.findFirst({
    where: {
      OR: [
        { categoryId, name },
        { slug: finalSlug },
      ],
    },
  });

  if (existingSubcategory) {
    if (existingSubcategory.slug === finalSlug) {
      throw new ApiError(409, "A subcategory with this slug already exists");
    }
    throw new ApiError(409, "A subcategory with this name already exists in the selected category");
  }

  return await prisma.subcategory.create({
    data: {
      categoryId,
      name,
      slug: finalSlug,
      isActive,
    },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
};

/**
 * Admin: List all subcategories (optional filter by categoryId)
 */
export const getAllSubcategoriesAdmin = async (categoryId) => {
  const where = categoryId ? { categoryId } : {};

  return await prisma.subcategory.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      category: {
        select: { id: true, name: true, slug: true, isActive: true },
      },
      _count: {
        select: { products: true },
      },
    },
  });
};

/**
 * Admin: Get single subcategory by ID
 */
export const getSubcategoryByIdAdmin = async (id) => {
  const subcategory = await prisma.subcategory.findUnique({
    where: { id },
    include: {
      category: {
        select: { id: true, name: true, slug: true, isActive: true },
      },
      _count: {
        select: { products: true },
      },
    },
  });

  if (!subcategory) {
    throw new ApiError(404, "Subcategory not found");
  }

  return subcategory;
};

/**
 * Admin: Update subcategory
 */
export const updateSubcategory = async (id, updateData) => {
  const existingSubcategory = await prisma.subcategory.findUnique({
    where: { id },
  });

  if (!existingSubcategory) {
    throw new ApiError(404, "Subcategory not found");
  }

  const dataToUpdate = { ...updateData };
  const targetCategoryId = updateData.categoryId || existingSubcategory.categoryId;

  // Check parent category if changed
  if (updateData.categoryId && updateData.categoryId !== existingSubcategory.categoryId) {
    const parentCategory = await prisma.category.findUnique({
      where: { id: updateData.categoryId },
    });
    if (!parentCategory || !parentCategory.isActive) {
      throw new ApiError(404, "Target parent category not found or is currently inactive");
    }
  }

  if (updateData.name && !updateData.slug) {
    dataToUpdate.slug = slugify(updateData.name);
  } else if (updateData.slug) {
    dataToUpdate.slug = slugify(updateData.slug);
  }

  // Check uniqueness constraints if name or slug or categoryId changed
  if (dataToUpdate.name || dataToUpdate.slug || updateData.categoryId) {
    const duplicate = await prisma.subcategory.findFirst({
      where: {
        id: { not: id },
        OR: [
          ...(dataToUpdate.name ? [{ categoryId: targetCategoryId, name: dataToUpdate.name }] : []),
          ...(dataToUpdate.slug ? [{ slug: dataToUpdate.slug }] : []),
        ],
      },
    });

    if (duplicate) {
      if (dataToUpdate.slug && duplicate.slug === dataToUpdate.slug) {
        throw new ApiError(409, "Another subcategory already exists with this slug");
      }
      throw new ApiError(409, "Another subcategory with this name already exists in this category");
    }
  }

  return await prisma.subcategory.update({
    where: { id },
    data: dataToUpdate,
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
};

/**
 * Admin: Soft delete subcategory (sets isActive to false)
 */
export const deleteSubcategory = async (id) => {
  const existingSubcategory = await prisma.subcategory.findUnique({
    where: { id },
  });

  if (!existingSubcategory) {
    throw new ApiError(404, "Subcategory not found");
  }

  return await prisma.$transaction(async (tx) => {
    // Soft delete associated products
    await tx.product.updateMany({
      where: { subcategoryId: id },
      data: { isActive: false },
    });

    return await tx.subcategory.update({
      where: { id },
      data: { isActive: false },
    });
  });
};

/**
 * Public: List active subcategories (with optional category filter)
 */
export const getActiveSubcategoriesPublic = async (categoryFilter) => {
  const where = {
    isActive: true,
    category: {
      isActive: true,
    },
  };

  if (categoryFilter) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryFilter);
    where.category = {
      isActive: true,
      ...(isUuid ? { id: categoryFilter } : { slug: categoryFilter }),
    };
  }

  return await prisma.subcategory.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
};

/**
 * Public: Get single active subcategory by ID or slug
 */
export const getSubcategoryBySlugOrIdPublic = async (identifier) => {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

  const subcategory = await prisma.subcategory.findFirst({
    where: {
      isActive: true,
      category: { isActive: true },
      ...(isUuid ? { id: identifier } : { slug: identifier }),
    },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  if (!subcategory) {
    throw new ApiError(404, "Subcategory not found");
  }

  return subcategory;
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
