import { z } from "zod";

export const createAddressSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters long")
    .max(100, "Full name cannot exceed 100 characters"),
  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number cannot exceed 20 characters"),
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
    .min(3, "Postal/ZIP code is required")
    .max(20, "Postal code cannot exceed 20 characters"),
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
