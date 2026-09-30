import { z } from 'zod';

const MOBILE_REGEX = /^(?:\+91[- ]?|0)?[6-9]\d{9}$/;

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
    .refine(
      (val) => !val || MOBILE_REGEX.test(val),
      'Please enter a valid 10-digit mobile number'
    )
    .optional()
    .or(z.literal('')),
});
