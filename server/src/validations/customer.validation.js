import { z } from "zod";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_10_DIGIT_REGEX = /^\d{10}$/;
const POSTAL_CODE_6_DIGIT_REGEX = /^\d{6}$/;

export const updateCustomerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters long")
    .max(50, "Name cannot exceed 50 characters")
    .optional(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(150, "Email cannot exceed 150 characters")
    .regex(EMAIL_REGEX, "Invalid email address format")
    .optional(),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => !val || PHONE_10_DIGIT_REGEX.test(val),
      "Phone number must be exactly 10 digits"
    )
    .optional()
    .nullable(),
  isActive: z.boolean().optional(),
});

export const toggleCustomerStatusSchema = z.object({
  isActive: z.boolean(),
});

export const customerQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  search: z.string().trim().optional(),
});

export const updateCustomerAddressSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),
  phone: z
    .string()
    .trim()
    .regex(PHONE_10_DIGIT_REGEX, "Phone number must be exactly 10 digits")
    .optional(),
  address: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters long")
    .optional(),
  city: z
    .string()
    .trim()
    .min(2, "City must be at least 2 characters long")
    .max(100, "City cannot exceed 100 characters")
    .optional(),
  state: z
    .string()
    .trim()
    .min(2, "State must be at least 2 characters long")
    .max(100, "State cannot exceed 100 characters")
    .optional(),
  postalCode: z
    .string()
    .trim()
    .regex(POSTAL_CODE_6_DIGIT_REGEX, "PIN / Postal code must be exactly 6 digits")
    .optional(),
  country: z.string().trim().max(100, "Country cannot exceed 100 characters").default("India").optional(),
  isDefault: z.boolean().optional(),
});

export const createCustomerAdminSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(1, "Name is required")
    .min(3, "Name must be at least 3 characters long")
    .max(50, "Name cannot exceed 50 characters"),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .min(1, "Email is required")
    .max(150, "Email cannot exceed 150 characters")
    .regex(EMAIL_REGEX, "Invalid email address format"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password cannot exceed 100 characters"),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => !val || PHONE_10_DIGIT_REGEX.test(val),
      "Phone number must be exactly 10 digits"
    )
    .optional()
    .nullable()
    .or(z.literal("")),
  address: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters long")
        .max(100, "Name cannot exceed 100 characters")
        .optional()
        .or(z.literal("")),
      phone: z
        .string()
        .trim()
        .refine(
          (val) => !val || PHONE_10_DIGIT_REGEX.test(val),
          "Phone number must be exactly 10 digits"
        )
        .optional()
        .or(z.literal("")),
      address: z
        .string({ required_error: "Street address is required" })
        .trim()
        .min(1, "Street address is required")
        .min(5, "Address must be at least 5 characters long"),
      city: z
        .string({ required_error: "City is required" })
        .trim()
        .min(1, "City is required")
        .min(2, "City must be at least 2 characters long")
        .max(100, "City cannot exceed 100 characters"),
      state: z
        .string({ required_error: "State is required" })
        .trim()
        .min(1, "State is required")
        .min(2, "State must be at least 2 characters long")
        .max(100, "State cannot exceed 100 characters"),
      postalCode: z
        .string({ required_error: "PIN / Postal code is required" })
        .trim()
        .min(1, "PIN / Postal code is required")
        .regex(POSTAL_CODE_6_DIGIT_REGEX, "PIN / Postal code must be exactly 6 digits"),
      country: z.string().trim().max(100, "Country cannot exceed 100 characters").default("India").optional(),
    })
    .optional()
    .nullable(),
});

export default {
  updateCustomerSchema,
  toggleCustomerStatusSchema,
  customerQuerySchema,
  updateCustomerAddressSchema,
  createCustomerAdminSchema,
};
