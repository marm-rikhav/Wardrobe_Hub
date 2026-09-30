import { z } from "zod";

export const addToCartSchema = z.object({
  variantId: z.string().uuid("Invalid variant ID format"),
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .int("Quantity must be an integer")
    .positive("Quantity must be greater than zero")
    .default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .int("Quantity must be an integer")
    .positive("Quantity must be greater than zero"),
});

export default {
  addToCartSchema,
  updateCartItemSchema,
};
