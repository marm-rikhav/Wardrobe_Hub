import { z } from 'zod';

export const subcategorySchema = z.object({
  categoryId: z
    .string({ required_error: 'Parent category is required' })
    .uuid('Please select a valid parent category'),
  name: z
    .string({ required_error: 'Subcategory name is required' })
    .trim()
    .min(2, 'Subcategory name must be at least 2 characters')
    .max(100, 'Subcategory name cannot exceed 100 characters'),
  slug: z
    .string()
    .trim()
    .max(120, 'Slug cannot exceed 120 characters')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().default(true),
});

export default {
  subcategorySchema,
};
