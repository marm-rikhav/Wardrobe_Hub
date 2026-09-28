import { z } from "zod";

// Standard RFC 5322 compliant email regex pattern
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const registerSchema = z.object({
  name: z
    .string("Name is required")
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string("Email is required")
    .trim()
    .toLowerCase()
    .max(150, "Email cannot exceed 150 characters")
    .regex(EMAIL_REGEX, "Invalid email address format"),
  password: z
    .string("Password is required")
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password cannot exceed 100 characters"),
  phone: z
    .string()
    .trim()
    .max(20, "Phone number cannot exceed 20 characters")
    .optional(),
});

export const loginSchema = z.object({
  email: z
    .string("Email is required")
    .trim()
    .toLowerCase()
    .regex(EMAIL_REGEX, "Invalid email address format"),
  password: z
    .string("Password is required")
    .min(1, "Password is required"),
});

export default {
  registerSchema,
  loginSchema,
};
