import { z } from "zod";

export const ORDER_STATUS_VALUES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

export const createOrderSchema = z.object({
  addressId: z.string().uuid("Invalid address ID format"),
});

export const orderIdParamSchema = z.object({
  id: z.string().uuid("Invalid order ID format"),
});

export const updateOrderStatusSchema = z.object({
  status: z
    .string()
    .trim()
    .toUpperCase()
    .refine((val) => ORDER_STATUS_VALUES.includes(val), {
      message: "Invalid order status value",
    }),
});

export const adminOrderQuerySchema = z.object({
  status: z
    .string()
    .trim()
    .toUpperCase()
    .refine((val) => val === "ALL" || ORDER_STATUS_VALUES.includes(val), {
      message: "Invalid order status filter",
    })
    .optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export default {
  ORDER_STATUS_VALUES,
  createOrderSchema,
  orderIdParamSchema,
  updateOrderStatusSchema,
  adminOrderQuerySchema,
};
