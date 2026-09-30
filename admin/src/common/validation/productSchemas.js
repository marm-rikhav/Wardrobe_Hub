import { z } from 'zod';

export const variantSchema = z.object({
  id: z.string().uuid('Invalid variant ID format').optional(),
  sku: z
    .string('SKU is required')
    .trim()
    .refine((val) => val.length > 0, 'SKU is required')
    .refine((val) => val.length === 0 || val.length >= 2, 'SKU must be at least 2 characters')
    .max(50, 'SKU cannot exceed 50 characters')
    .transform((val) => val.toUpperCase()),
  size: z
    .string('Size is required')
    .trim()
    .min(1, 'Size is required')
    .max(20, 'Size cannot exceed 20 characters'),
  color: z
    .string('Color is required')
    .trim()
    .min(1, 'Color is required')
    .max(30, 'Color cannot exceed 30 characters'),
  price: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z
      .number('Price must be a valid number')
      .positive('Price must be greater than 0')
      .optional()
  ),
  stock: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? 0 : Number(val)),
    z
      .number('Stock is required and must be a number')
      .int('Stock must be a whole number')
      .min(0, 'Stock cannot be negative (>= 0)')
  ),
  isActive: z.boolean().default(true),
});

export const productSchema = z
  .object({
    name: z
      .string('Product name is required')
      .trim()
      .refine((val) => val.length > 0, 'Product name is required')
      .refine((val) => val.length === 0 || val.length >= 2, 'Product name must be at least 2 characters')
      .max(200, 'Product name cannot exceed 200 characters'),
    subcategoryId: z
      .string('Please select a subcategory')
      .refine((val) => Boolean(val?.trim()), 'Please select a subcategory')
      .refine(
        (val) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val),
        'Please select a valid subcategory'
      ),
    brand: z
      .string('Brand is required')
      .trim()
      .min(1, 'Brand is required')
      .max(100, 'Brand cannot exceed 100 characters'),
    description: z
      .string('Description is required')
      .trim()
      .min(1, 'Description is required'),
    basePrice: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z
        .number('Base price is required and must be a number')
        .positive('Base price must be greater than 0')
    ),
    discountPrice: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
      z
        .number('Discount price must be a valid number')
        .positive('Discount price must be greater than 0')
        .nullable()
        .optional()
    ),
    isActive: z.boolean().default(true),
    variants: z
      .array(variantSchema, 'A product must have at least one variant (size + color)')
      .min(1, 'A product must have at least one variant (size + color)'),
  })
  .refine(
    (data) => {
      if (data.discountPrice !== undefined && data.discountPrice !== null) {
        return data.discountPrice <= data.basePrice;
      }
      return true;
    },
    {
      message: 'Discount price cannot be higher than base price',
      path: ['discountPrice'],
    }
  );

export default {
  variantSchema,
  productSchema,
};
