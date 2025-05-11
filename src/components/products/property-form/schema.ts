
import { z } from 'zod';
import { PropertyDataType } from '@/types/product';

export const propertyFormSchema = z.object({
  name: z.string().min(1, "Property name is required"),
  description: z.string().optional(),
  data_type: z.enum(["string", "number", "boolean", "location", "enum", "json", "datetime"]),
  unit: z.string().optional(),
  is_required: z.boolean().default(false),
  default_value: z.any().optional(),
  validation_rules: z.object({
    min: z.number().nullable().optional(),
    max: z.number().nullable().optional(),
    pattern: z.string().nullable().optional(),
    options: z.array(z.string()).nullable().optional(),
    min_length: z.number().nullable().optional(),
    max_length: z.number().nullable().optional(),
    precision: z.number().nullable().optional(),
    format: z.string().nullable().optional(),
    allowed_values: z.array(z.any()).nullable().optional(),
  }).optional(),
});

// Add PropertyFormSchema type export for type consistency
export type PropertyFormSchema = z.infer<typeof propertyFormSchema>;
