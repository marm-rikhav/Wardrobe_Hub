import { z } from 'zod';
import { validateStrictEmail, validateStrictPhone } from './validationRules.js';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .trim()
    .toLowerCase()
    .superRefine((val, ctx) => {
      const res = validateStrictEmail(val);
      if (!res.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: res.message || 'Invalid email address format',
        });
      }
    }),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .min(3, 'Name must be at least 3 characters long')
      .max(50, 'Name cannot exceed 50 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .trim()
      .toLowerCase()
      .max(150, 'Email cannot exceed 150 characters')
      .superRefine((val, ctx) => {
        const res = validateStrictEmail(val);
        if (!res.isValid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: res.message || 'Invalid email address format',
          });
        }
      }),
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
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters long')
      .max(100, 'Password cannot exceed 100 characters'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
