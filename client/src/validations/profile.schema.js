import { z } from 'zod';

const PHONE_10_DIGIT_REGEX = /^\d{10}$/;

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .min(3, 'Name must be at least 3 characters long')
    .max(50, 'Name cannot exceed 50 characters'),
  email: z
    .string()
    .email('Invalid email address')
    .optional(),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => !val || PHONE_10_DIGIT_REGEX.test(val),
      'Phone number must be exactly 10 digits'
    )
    .optional()
    .or(z.literal('')),
});
