import { z } from 'zod';

export const categorySchema = z.object({
  name: z
    .string({ required_error: 'Category name is required' })
    .trim()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name cannot exceed 100 characters'),
  slug: z
    .string()
    .trim()
    .max(120, 'Slug cannot exceed 120 characters')
    .optional()
    .or(z.literal('')),
  imageUrl: z
    .string()
    .trim()
    .url('Image URL must be a valid URL')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().default(true),
});

export default {
  categorySchema,
};
