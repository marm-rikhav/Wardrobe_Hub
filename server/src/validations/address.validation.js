import { z } from "zod";

const PHONE_10_DIGIT_REGEX = /^\d{10}$/;
const POSTAL_CODE_6_DIGIT_REGEX = /^\d{6}$/;

export const createAddressSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters long")
    .max(100, "Full name cannot exceed 100 characters"),
  phone: z
    .string()
    .trim()
    .regex(PHONE_10_DIGIT_REGEX, "Phone number must be exactly 10 digits"),
  address: z
    .string()
    .trim()
    .min(5, "Street address must be at least 5 characters long"),
  city: z
    .string()
    .trim()
    .min(2, "City must be at least 2 characters long")
    .max(100, "City cannot exceed 100 characters"),
  state: z
    .string()
    .trim()
    .min(2, "State must be at least 2 characters long")
    .max(100, "State cannot exceed 100 characters"),
  postalCode: z
    .string()
    .trim()
    .regex(POSTAL_CODE_6_DIGIT_REGEX, "PIN / Postal code must be exactly 6 digits"),
  country: z
    .string()
    .trim()
    .max(100, "Country cannot exceed 100 characters")
    .default("India")
    .optional(),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();

export default {
  createAddressSchema,
  updateAddressSchema,
};
