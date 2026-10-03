import { z } from "zod";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createSubcategorySchema = z.object({
  categoryId: z
    .string({ required_error: "Category ID is required" })
    .uuid("Invalid Category ID format (must be UUID)"),
  name: z
    .string({ required_error: "Subcategory name is required" })
    .trim()
    .min(2, "Subcategory name must be at least 2 characters long")
    .max(100, "Subcategory name cannot exceed 100 characters"),
  slug: z
    .string({ required_error: "Slug is required" })
    .trim()
    .min(2, "Slug must be at least 2 characters long")
    .max(120, "Slug cannot exceed 120 characters")
    .regex(SLUG_REGEX, "Slug must be lowercase alphanumeric with hyphens (e.g. casual-shirts)"),
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
    .min(2, "Slug must be at least 2 characters long")
    .max(120, "Slug cannot exceed 120 characters")
    .regex(SLUG_REGEX, "Slug must be lowercase alphanumeric with hyphens (e.g. casual-shirts)")
    .optional(),
  isActive: z.boolean().optional(),
});

export default {
  createSubcategorySchema,
  updateSubcategorySchema,
};
