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

  if (!category?.isActive) {
    throw new ApiError(404, "Parent category not found or is currently inactive");
  }

  // 2. Generate slug
  const finalSlug = slug ? slugify(slug) : slugify(`${category.slug}-${name}`);

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
 * Validate parent category change if categoryId is updated
 */
const validateParentCategoryChange = async (targetCategoryId, currentCategoryId) => {
  if (!targetCategoryId || targetCategoryId === currentCategoryId) {
    return;
  }
  const parentCategory = await prisma.category.findUnique({
    where: { id: targetCategoryId },
  });
  if (!parentCategory?.isActive) {
    throw new ApiError(404, "Target parent category not found or is currently inactive");
  }
};

/**
 * Resolve slug for subcategory update
 */
const resolveSubcategorySlug = (name, slug) => {
  if (slug) {
    return slugify(slug);
  }
  if (name) {
    return slugify(name);
  }
  return undefined;
};

/**
 * Check subcategory uniqueness constraints on name or slug update
 */
const validateSubcategoryUniqueness = async (id, targetCategoryId, name, slug) => {
  const orConditions = [];
  if (name) {
    orConditions.push({ categoryId: targetCategoryId, name });
  }
  if (slug) {
    orConditions.push({ slug });
  }

  if (orConditions.length === 0) {
    return;
  }

  const duplicate = await prisma.subcategory.findFirst({
    where: {
      id: { not: id },
      OR: orConditions,
    },
  });

  if (!duplicate) {
    return;
  }

  if (slug && duplicate.slug === slug) {
    throw new ApiError(409, "Another subcategory already exists with this slug");
  }
  throw new ApiError(409, "Another subcategory with this name already exists in this category");
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

  await validateParentCategoryChange(updateData.categoryId, existingSubcategory.categoryId);

  const dataToUpdate = { ...updateData };
  const updatedSlug = resolveSubcategorySlug(updateData.name, updateData.slug);
  if (updatedSlug) {
    dataToUpdate.slug = updatedSlug;
  }

  const targetCategoryId = updateData.categoryId || existingSubcategory.categoryId;
  if (dataToUpdate.name || dataToUpdate.slug || updateData.categoryId) {
    await validateSubcategoryUniqueness(id, targetCategoryId, dataToUpdate.name, dataToUpdate.slug);
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
