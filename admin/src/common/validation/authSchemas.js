import { z } from 'zod';

// Standard RFC 5322 compliant regex matching backend email format
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Zod validation schema for the Admin Login form.
 * Matches backend validation constraints.
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .min(1, 'Email is required')
    .max(150, 'Email cannot exceed 150 characters')
    .regex(EMAIL_REGEX, 'Please enter a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

export default {
  loginSchema,
};
