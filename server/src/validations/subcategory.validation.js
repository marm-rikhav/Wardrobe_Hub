import { z } from "zod";

export const createSubcategorySchema = z.object({
  categoryId: z
    .string("Category ID is required")
    .uuid("Invalid Category ID format (must be UUID)"),
  name: z
    .string("Subcategory name is required")
    .trim()
    .min(2, "Subcategory name must be at least 2 characters long")
    .max(100, "Subcategory name cannot exceed 100 characters"),
  slug: z
    .string()
    .trim()
    .max(120, "Slug cannot exceed 120 characters")
    .optional(),
  isActive: z.boolean().optional(),
});

export const updateSubcategorySchema = z.object({
  categoryId: z
    .string()
    .uuid("Invalid Category ID format (must be UUID)")
    .optional(),
  name: z
    .string()
    .trim()
    .min(2, "Subcategory name must be at least 2 characters long")
    .max(100, "Subcategory name cannot exceed 100 characters")
    .optional(),
  slug: z
    .string()
    .trim()
    .max(120, "Slug cannot exceed 120 characters")
    .optional(),
  isActive: z.boolean().optional(),
});

export default {
  createSubcategorySchema,
  updateSubcategorySchema,
};
