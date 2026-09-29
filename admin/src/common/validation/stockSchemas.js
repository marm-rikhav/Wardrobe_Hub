import { z } from 'zod';

export const stockUpdateSchema = z.object({
  stock: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z
      .number({ required_error: 'Stock is required', invalid_type_error: 'Stock must be a number' })
      .int('Stock must be an integer')
      .min(0, 'Stock cannot be negative (must be >= 0)')
  ),
});

export default {
  stockUpdateSchema,
};
