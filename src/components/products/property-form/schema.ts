
import { z } from 'zod';

export const propertyFormSchema = z.object({
  name: z.string().min(1, "Property name is required"),
  description: z.string().optional(),
  data_type: z.enum(["string", "number", "boolean", "location"]),
  unit: z.string().optional(),
  is_required: z.boolean().default(false),
  default_value: z.any().optional(),
  validation_rules: z.object({
    min: z.number().nullable().optional(),
    max: z.number().nullable().optional(),
    pattern: z.string().nullable().optional(),
    options: z.array(z.string()).nullable().optional(),
  }).optional(),
});
