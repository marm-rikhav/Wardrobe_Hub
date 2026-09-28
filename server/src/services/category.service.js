import prisma from "../lib/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { slugify } from "../utils/slugify.js";

/**
 * Admin: Create a new category
 */
export const createCategory = async ({ name, slug, imageUrl, isActive = true }) => {
  const finalSlug = slug ? slugify(slug) : slugify(name);

  if (!finalSlug) {
    throw new ApiError(400, "Unable to generate a valid slug for this category");
  }

  // Check uniqueness of name and slug
  const existingCategory = await prisma.category.findFirst({
    where: {
      OR: [{ name }, { slug: finalSlug }],
    },
  });

  if (existingCategory) {
    if (existingCategory.name.toLowerCase() === name.toLowerCase()) {
      throw new ApiError(409, "Category with this name already exists");
    }
    throw new ApiError(409, "Category with this slug already exists");
  }

  return await prisma.category.create({
    data: {
      name,
      slug: finalSlug,
      imageUrl: imageUrl || null,
      isActive,
    },
  });
};

/**
 * Admin: Get all categories (active and inactive)
 */
export const getAllCategoriesAdmin = async () => {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { subcategories: true },
      },
    },
  });
};

/**
 * Admin: Get single category by ID
 */
export const getCategoryByIdAdmin = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      subcategories: {
        orderBy: { name: "asc" },
      },
    },
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return category;
};

/**
 * Admin: Update category
 */
export const updateCategory = async (id, updateData) => {
  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new ApiError(404, "Category not found");
  }

  const dataToUpdate = { ...updateData };

  if (updateData.name && !updateData.slug) {
    dataToUpdate.slug = slugify(updateData.name);
  } else if (updateData.slug) {
    dataToUpdate.slug = slugify(updateData.slug);
  }

  // Check unique constraints if name or slug is being changed
  if (dataToUpdate.name || dataToUpdate.slug) {
    const duplicate = await prisma.category.findFirst({
      where: {
        id: { not: id },
        OR: [
          ...(dataToUpdate.name ? [{ name: dataToUpdate.name }] : []),
          ...(dataToUpdate.slug ? [{ slug: dataToUpdate.slug }] : []),
        ],
      },
    });

    if (duplicate) {
      if (dataToUpdate.name && duplicate.name.toLowerCase() === dataToUpdate.name.toLowerCase()) {
        throw new ApiError(409, "Another category already exists with this name");
      }
      throw new ApiError(409, "Another category already exists with this slug");
    }
  }

  return await prisma.category.update({
    where: { id },
    data: dataToUpdate,
  });
};

/**
 * Admin: Soft delete category (sets isActive to false)
 */
export const deleteCategory = async (id) => {
  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new ApiError(404, "Category not found");
  }

  // Soft delete category and its subcategories
  return await prisma.$transaction(async (tx) => {
    await tx.subcategory.updateMany({
      where: { categoryId: id },
      data: { isActive: false },
    });

    return await tx.category.update({
      where: { id },
      data: { isActive: false },
    });
  });
};

/**
 * Public: Get active categories with active subcategories
 */
export const getActiveCategoriesPublic = async () => {
  return await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: {
      subcategories: {
        where: { isActive: true },
        orderBy: { name: "asc" },
      },
    },
  });
};

/**
 * Public: Get single active category by ID or slug
 */
export const getCategoryBySlugOrIdPublic = async (identifier) => {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

  const category = await prisma.category.findFirst({
    where: {
      isActive: true,
      ...(isUuid ? { id: identifier } : { slug: identifier }),
    },
    include: {
      subcategories: {
        where: { isActive: true },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return category;
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
