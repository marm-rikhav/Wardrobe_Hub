import { z } from 'zod';

export const profileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .trim()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string()
    .email('Invalid email address')
    .optional(),
  phone: z
    .string()
    .trim()
    .max(10, 'Phone cannot exceed 10 characters')
    .optional()
    .or(z.literal('')),
});
