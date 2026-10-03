import { z } from "zod";

const POSTAL_CODE_6_DIGIT_REGEX = /^\d{6}$/;

const TYPO_DOMAINS = new Set([
  "gamil.com", "gmial.com", "gmaill.com", "gmai.com", "gmal.com", "gmaik.com",
  "gamil.co", "gamil.in", "gmai.in", "gmai.co", "yaho.com", "yahooo.com",
  "yhaoo.com", "yaho.co", "ymail.co", "yaho.in", "yaho.net", "hotmial.com",
  "hotmai.com", "hotmaill.com", "hotmial.co", "outlok.com", "outloo.com",
  "outlok.co", "redifmail.com", "rediffmial.com", "redif.com", "icld.com", "icloud.co",
]);

const DUMMY_SEQUENTIAL_NUMBERS = new Set(["0123456789", "1234567890", "9876543210"]);
const STANDARD_EMAIL_REGEX =
  /^[a-zA-Z0-9]+([._%+-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,24}$/;
const CONSECUTIVE_CONSONANTS_REGEX = /[bcdfghjklmnpqrstvwxyz]{6,}/i;
const REPEATED_CHARS_REGEX = /([a-zA-Z0-9])\1{3,}/;
const VOWELS_REGEX = /[aeiouy]/i;
const LETTERS_ONLY_REGEX = /^[a-zA-Z]+$/;

export const isStrictEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const normalized = email.trim().toLowerCase();
  if (normalized.length < 5 || normalized.length > 150) return false;
  if (normalized.includes("..")) return false;
  if (!STANDARD_EMAIL_REGEX.test(normalized)) return false;
  const parts = normalized.split("@");
  if (parts.length !== 2) return false;
  const [localPart, domainPart] = parts;
  if (TYPO_DOMAINS.has(domainPart)) return false;
  const domainLabels = domainPart.split(".");
  const tld = domainLabels[domainLabels.length - 1];
  if (!tld || tld.length < 2 || !/^[a-z]+$/.test(tld)) return false;
  if (REPEATED_CHARS_REGEX.test(localPart)) return false;
  if (CONSECUTIVE_CONSONANTS_REGEX.test(localPart)) return false;
  if (localPart.length >= 5 && LETTERS_ONLY_REGEX.test(localPart) && !VOWELS_REGEX.test(localPart)) return false;
  return true;
};

export const isStrictPhone = (phone) => {
  if (!phone || typeof phone !== "string") return false;
  const trimmed = phone.trim();
  if (!/^\d{10}$/.test(trimmed)) return false;
  if (!/^[6-9]/.test(trimmed)) return false;
  if (/^(\d)\1{9}$/.test(trimmed)) return false;
  if (DUMMY_SEQUENTIAL_NUMBERS.has(trimmed)) return false;
  const uniqueDigits = new Set(trimmed);
  if (uniqueDigits.size < 4) return false;
  return true;
};

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
    .refine(isStrictEmail, "Please provide a valid, legitimate email address")
    .optional(),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => !val || isStrictPhone(val),
      "Phone number must be a valid 10-digit mobile number starting with 6, 7, 8, or 9"
    )
    .optional()
    .nullable(),
  isActive: z.boolean().optional(),
  address: z
    .object({
      id: z.string().uuid().optional(),
      name: z.string().trim().min(2, "Name must be at least 2 characters long").max(100).optional(),
      phone: z.string().trim().refine((val) => !val || isStrictPhone(val), "Phone number must be a valid 10-digit mobile number").optional(),
      address: z.string().trim().min(5, "Address must be at least 5 characters long").optional(),
      city: z.string().trim().min(2, "City must be at least 2 characters long").max(100).optional(),
      state: z.string().trim().min(2, "State must be at least 2 characters long").max(100).optional(),
      postalCode: z.string().trim().regex(POSTAL_CODE_6_DIGIT_REGEX, "PIN / Postal code must be exactly 6 digits").optional(),
      country: z.string().trim().max(100).default("India").optional(),
      isDefault: z.boolean().optional(),
    })
    .optional()
    .nullable(),
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
    .refine((val) => !val || isStrictPhone(val), "Phone number must be a valid 10-digit mobile number")
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
    .refine(isStrictEmail, "Please provide a valid, legitimate email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password cannot exceed 100 characters"),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => !val || isStrictPhone(val),
      "Phone number must be a valid 10-digit mobile number"
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
          (val) => !val || isStrictPhone(val),
          "Phone number must be a valid 10-digit mobile number"
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

export const customerIdParamSchema = z.object({
  id: z.string().uuid("Invalid customer ID format"),
});

export const customerAddressParamsSchema = z.object({
  id: z.string().uuid("Invalid customer ID format"),
  addressId: z.string().uuid("Invalid address ID format"),
});

export default {
  updateCustomerSchema,
  toggleCustomerStatusSchema,
  customerQuerySchema,
  updateCustomerAddressSchema,
  createCustomerAdminSchema,
  customerIdParamSchema,
  customerAddressParamsSchema,
};

