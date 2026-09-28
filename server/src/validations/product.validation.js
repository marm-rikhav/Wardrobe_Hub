import { z } from "zod";

export const variantSchema = z.object({
  id: z.string().uuid("Invalid variant ID").optional(),
  sku: z
    .string("SKU is required")
    .trim()
    .min(2, "SKU must be at least 2 characters")
    .max(50, "SKU cannot exceed 50 characters")
    .toUpperCase(),
  size: z
    .string("Size is required")
    .trim()
    .min(1, "Size is required")
    .max(20, "Size cannot exceed 20 characters"),
  color: z
    .string("Color is required")
    .trim()
    .min(1, "Color is required")
    .max(30, "Color cannot exceed 30 characters"),
  price: z
    .number("Variant price must be a number")
    .positive("Variant price must be greater than 0")
    .nullable()
    .optional(),
  stock: z
    .number("Stock must be an integer")
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative (must be >= 0)"),
  isActive: z.boolean().optional(),
});

export const createProductSchema = z
  .object({
    subcategoryId: z
      .string("Subcategory ID is required")
      .uuid("Invalid subcategory ID format (must be UUID)"),
    name: z
      .string("Product name is required")
      .trim()
      .min(2, "Product name must be at least 2 characters long")
      .max(200, "Product name cannot exceed 200 characters"),
    slug: z
      .string()
      .trim()
      .max(220, "Slug cannot exceed 220 characters")
      .optional(),
    description: z.string().trim().optional(),
    brand: z.string().trim().max(100, "Brand cannot exceed 100 characters").optional(),
    basePrice: z
      .number("Base price is required")
      .positive("Base price must be greater than 0"),
    discountPrice: z
      .number("Discount price must be a number")
      .positive("Discount price must be greater than 0")
      .nullable()
      .optional(),
    isActive: z.boolean().optional(),
    variants: z
      .array(variantSchema)
      .min(1, "A product must have at least one variant (size + color)"),
  })
  .refine(
    (data) => {
      if (data.discountPrice !== undefined && data.discountPrice !== null) {
        return data.discountPrice <= data.basePrice;
      }
      return true;
    },
    {
      message: "Discount price cannot be higher than base price",
      path: ["discountPrice"],
    }
  );

export const updateProductSchema = z
  .object({
    subcategoryId: z
      .string()
      .uuid("Invalid subcategory ID format (must be UUID)")
      .optional(),
    name: z
      .string()
      .trim()
      .min(2, "Product name must be at least 2 characters long")
      .max(200, "Product name cannot exceed 200 characters")
      .optional(),
    slug: z
      .string()
      .trim()
      .max(220, "Slug cannot exceed 220 characters")
      .optional(),
    description: z.string().trim().nullable().optional(),
    brand: z.string().trim().max(100, "Brand cannot exceed 100 characters").nullable().optional(),
    basePrice: z
      .number()
      .positive("Base price must be greater than 0")
      .optional(),
    discountPrice: z
      .number()
      .positive("Discount price must be greater than 0")
      .nullable()
      .optional(),
    isActive: z.boolean().optional(),
    variants: z.array(variantSchema).optional(),
  })
  .refine(
    (data) => {
      if (
        data.basePrice !== undefined &&
        data.discountPrice !== undefined &&
        data.discountPrice !== null
      ) {
        return data.discountPrice <= data.basePrice;
      }
      return true;
    },
    {
      message: "Discount price cannot be higher than base price",
      path: ["discountPrice"],
    }
  );

export const productQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  subcategory: z.string().trim().optional(),
  size: z.string().trim().optional(),
  color: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0, "minPrice must be non-negative").optional(),
  maxPrice: z.coerce.number().min(0, "maxPrice must be non-negative").optional(),
  sort: z.enum(["newest", "price_asc", "price_desc"]).default("newest").optional(),
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce.number().int().min(1).max(100, "Limit cannot exceed 100").default(20),
});

export const uploadImageBodySchema = z.object({
  color: z.string().trim().max(30).optional(),
  sortOrder: z.coerce.number().int().min(0).default(0).optional(),
});

export default {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  uploadImageBodySchema,
};
