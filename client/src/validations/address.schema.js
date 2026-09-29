import { z } from 'zod';

export const addressSchema = z.object({
  name: z
    .string()
    .min(1, 'Full name is required')
    .trim()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name cannot exceed 100 characters'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .trim()
    .min(10, 'Phone must be at least 10 digits')
    .max(20, 'Phone cannot exceed 20 characters'),
  address: z
    .string()
    .min(1, 'Street address is required')
    .trim()
    .min(5, 'Address must be at least 5 characters long'),
  city: z
    .string()
    .min(1, 'City is required')
    .trim()
    .min(2, 'City must be at least 2 characters long')
    .max(100, 'City cannot exceed 100 characters'),
  state: z
    .string()
    .min(1, 'State is required')
    .trim()
    .min(2, 'State must be at least 2 characters long')
    .max(100, 'State cannot exceed 100 characters'),
  postalCode: z
    .string()
    .min(1, 'Postal / ZIP code is required')
    .trim()
    .min(3, 'Postal code must be at least 3 characters')
    .max(20, 'Postal code cannot exceed 20 characters'),
  country: z
    .string()
    .trim()
    .max(100, 'Country cannot exceed 100 characters')
    .default('India'),
  isDefault: z.boolean().default(false),
});
