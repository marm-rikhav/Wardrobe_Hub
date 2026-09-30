import { z } from "zod";

export const ORDER_STATUS_VALUES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

export const PAYMENT_METHOD_VALUES = ["COD"];

export const PAYMENT_STATUS_VALUES = [
  "UNPAID",
  "PENDING",
  "PAID",
  "REFUNDED",
  "FAILED",
  "CANCELLED",
];

export const createOrderSchema = z.object({
  addressId: z.string().uuid("Invalid address ID format"),
  paymentMethod: z
    .string({
      required_error: "Payment method is required",
      invalid_type_error: "Payment method must be a string",
    })
    .trim()
    .toUpperCase()
    .refine((val) => val === "COD", {
      message: "Invalid payment method. Only Cash on Delivery (COD) is supported.",
    }),
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

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z
    .string({
      required_error: "Payment status is required",
      invalid_type_error: "Payment status must be a string",
    })
    .trim()
    .toUpperCase()
    .refine((val) => ["PAID", "CANCELLED", "REFUNDED", "FAILED"].includes(val), {
      message: "Invalid payment status value",
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
  PAYMENT_METHOD_VALUES,
  PAYMENT_STATUS_VALUES,
  createOrderSchema,
  orderIdParamSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
  adminOrderQuerySchema,
};
