import { z } from 'zod';
import { validateStrictPhone, POSTAL_CODE_6_DIGIT_REGEX } from './validationRules.js';

export const addressSchema = z.object({
  name: z
    .string()
    .min(1, 'Full name is required')
    .trim()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name cannot exceed 100 characters'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .superRefine((val, ctx) => {
      const res = validateStrictPhone(val);
      if (!res.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: res.message || 'Invalid phone number',
        });
      }
    }),
  address: z
    .string()
    .min(1, 'Street address is required')
    .trim()
    .min(5, 'Address must be at least 5 characters long'),
  city: z
    .string()
    .min(1, 'City is required')
    .trim()
    .min(2, 'City must be at least 2 characters long')
    .max(100, 'City cannot exceed 100 characters'),
  state: z
    .string()
    .min(1, 'State is required')
    .trim()
    .min(2, 'State must be at least 2 characters long')
    .max(100, 'State cannot exceed 100 characters'),
  postalCode: z
    .string()
    .trim()
    .min(1, 'PIN / Postal code is required')
    .regex(POSTAL_CODE_6_DIGIT_REGEX, 'PIN / Postal code must be exactly 6 digits'),
  country: z
    .string()
    .trim()
    .max(100, 'Country cannot exceed 100 characters')
    .default('India'),
  isDefault: z.boolean().default(false),
});
