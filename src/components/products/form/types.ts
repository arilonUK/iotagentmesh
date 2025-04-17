
import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  version: z.string().default('1.0'),
  category: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
});

export type ProductFormValues = z.infer<typeof productSchema>;
