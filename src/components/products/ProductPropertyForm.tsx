
import React from 'react';
import { PropertyForm } from './property-form';
import { PropertyFormValues } from '@/types/product';

interface ProductPropertyFormProps {
  onSubmit: (data: PropertyFormValues) => Promise<void>;
  initialValues?: Partial<PropertyFormValues>;
  isEditing?: boolean;
  defaultValues?: any;
  isLoading?: boolean;
}

const ProductPropertyForm: React.FC<ProductPropertyFormProps> = (props) => {
  return <PropertyForm {...props} />;
};

export default ProductPropertyForm;
