import { z } from 'zod';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .trim()
    .toLowerCase()
    .regex(EMAIL_REGEX, 'Invalid email address format'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .trim()
      .min(2, 'Name must be at least 2 characters long')
      .max(100, 'Name cannot exceed 100 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .trim()
      .toLowerCase()
      .max(150, 'Email cannot exceed 150 characters')
      .regex(EMAIL_REGEX, 'Invalid email address format'),
    phone: z
      .string()
      .trim()
      .max(20, 'Phone cannot exceed 20 characters')
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
