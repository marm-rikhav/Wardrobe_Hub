import { z } from "zod";

export const RETURN_REQUEST_TYPES = ["RETURN", "EXCHANGE"];
export const RETURN_REQUEST_STATUSES = ["PENDING", "APPROVED", "REJECTED"];

export const createReturnRequestSchema = z.object({
  type: z.enum(["RETURN", "EXCHANGE"], {
    required_error: "Request type is required",
    invalid_type_error: "Request type must be either RETURN or EXCHANGE",
  }),
  reason: z
    .string({
      required_error: "Reason is required",
      invalid_type_error: "Reason must be a string",
    })
    .trim()
    .min(1, "Reason is required and cannot be empty")
    .max(500, "Reason must not exceed 500 characters"),
  details: z
    .string({
      invalid_type_error: "Details must be a string",
    })
    .trim()
    .max(1000, "Details must not exceed 1000 characters")
    .optional(),
});

export const updateReturnRequestStatusSchema = z
  .object({
    status: z.enum(["APPROVED", "REJECTED"], {
      required_error: "Status is required",
      invalid_type_error: "Status must be either APPROVED or REJECTED",
    }),
    adminResponse: z
      .string({
        invalid_type_error: "Admin response must be a string",
      })
      .trim()
      .max(1000, "Admin response must not exceed 1000 characters")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.status === "REJECTED") {
        return Boolean(data.adminResponse && data.adminResponse.trim().length > 0);
      }
      return true;
    },
    {
      message: "Rejection reason is required when rejecting a request",
      path: ["adminResponse"],
    }
  );

export const returnRequestIdParamSchema = z.object({
  id: z.string().uuid("Invalid request ID format"),
});

export const adminReturnQuerySchema = z.object({
  status: z
    .string()
    .trim()
    .toUpperCase()
    .refine((val) => ["ALL", "PENDING", "APPROVED", "REJECTED"].includes(val), {
      message: "Invalid status filter. Allowed values: ALL, PENDING, APPROVED, REJECTED",
    })
    .optional(),
  type: z
    .string()
    .trim()
    .toUpperCase()
    .refine((val) => ["ALL", "RETURN", "EXCHANGE"].includes(val), {
      message: "Invalid type filter. Allowed values: ALL, RETURN, EXCHANGE",
    })
    .optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export default {
  RETURN_REQUEST_TYPES,
  RETURN_REQUEST_STATUSES,
  createReturnRequestSchema,
  updateReturnRequestStatusSchema,
  returnRequestIdParamSchema,
  adminReturnQuerySchema,
};
