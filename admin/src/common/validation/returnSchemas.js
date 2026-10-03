import { z } from 'zod';

export const rejectReturnRequestSchema = z.object({
  reason: z
    .string({ required_error: 'Please provide a reason for rejecting this request.' })
    .trim()
    .min(1, 'Please provide a reason for rejecting this request.')
    .max(1000, 'Reason cannot exceed 1000 characters'),
});

export default {
  rejectReturnRequestSchema,
};
