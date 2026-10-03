import { z } from 'zod';
import { validateStrictEmail, validateStrictPhone } from './validationRules.js';

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .min(3, 'Name must be at least 3 characters long')
    .max(50, 'Name cannot exceed 50 characters'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .superRefine((val, ctx) => {
      if (!val) return;
      const res = validateStrictEmail(val);
      if (!res.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: res.message || 'Invalid email address format',
        });
      }
    })
    .optional(),
  phone: z
    .string()
    .trim()
    .superRefine((val, ctx) => {
      if (!val) return;
      const res = validateStrictPhone(val);
      if (!res.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: res.message || 'Invalid phone number',
        });
      }
    })
    .optional()
    .or(z.literal('')),
});
