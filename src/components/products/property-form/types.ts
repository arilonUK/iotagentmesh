
import { z } from 'zod';
import { propertyFormSchema } from './schema';

export type PropertyFormSchema = z.infer<typeof propertyFormSchema>;

export interface PropertyFormProps {
  onSubmit: (data: PropertyFormSchema) => Promise<void>;
  initialValues?: Partial<PropertyFormSchema>;
  isEditing?: boolean;
  defaultValues?: any;
  isLoading?: boolean;
}
