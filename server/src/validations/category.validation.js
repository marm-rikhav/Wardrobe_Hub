import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string("Category name is required")
    .trim()
    .min(2, "Category name must be at least 2 characters long")
    .max(100, "Category name cannot exceed 100 characters"),
  slug: z
    .string()
    .trim()
    .max(120, "Slug cannot exceed 120 characters")
    .optional(),
  imageUrl: z
    .string()
    .trim()
    .url("Invalid image URL format")
    .nullable()
    .optional(),
  isActive: z.boolean().optional(),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters long")
    .max(100, "Category name cannot exceed 100 characters")
    .optional(),
  slug: z
    .string()
    .trim()
    .max(120, "Slug cannot exceed 120 characters")
    .optional(),
  imageUrl: z
    .string()
    .trim()
    .url("Invalid image URL format")
    .nullable()
    .optional(),
  isActive: z.boolean().optional(),
});

export default {
  createCategorySchema,
  updateCategorySchema,
};
