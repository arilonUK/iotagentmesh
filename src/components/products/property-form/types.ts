
import { z } from 'zod';
import { propertyFormSchema } from './schema';
import { ProductProperty, PropertyDataType } from '@/types/product';

// Make both types derive from the same schema
export type PropertyFormSchema = z.infer<typeof propertyFormSchema>;

export type PropertyFormValues = {
  name: string;
  description?: string;
  data_type: PropertyDataType;
  unit?: string;
  is_required: boolean;
  default_value?: string | number | boolean | null;
  validation_rules?: {
    min?: number | null;
    max?: number | null;
    pattern?: string | null;
    options?: string[] | null;
    min_length?: number | null;
    max_length?: number | null;
    precision?: number | null;
    format?: string | null;
    allowed_values?: Array<string | number | boolean> | null;
  };
};

export interface PropertyFormProps {
  onSubmit: (data: PropertyFormValues) => Promise<void>;
  initialValues?: Partial<PropertyFormValues>;
  isEditing?: boolean;
  defaultValues?: Partial<PropertyFormValues>;
  isLoading?: boolean;
}
