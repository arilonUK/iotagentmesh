
import React from 'react';
import { PropertyForm } from './property-form';
import { PropertyFormValues } from '@/types/product';
import { PropertyFormValues as FormValues } from './property-form/types';

interface ProductPropertyFormProps {
  onSubmit: (data: PropertyFormValues) => Promise<void>;
  initialValues?: Partial<PropertyFormValues>;
  isEditing?: boolean;
  defaultValues?: any;
  isLoading?: boolean;
}

const ProductPropertyForm: React.FC<ProductPropertyFormProps> = (props) => {
  // Convert between PropertyFormValues and FormValues if needed
  const handleSubmit = async (data: FormValues): Promise<void> => {
    return props.onSubmit(data as unknown as PropertyFormValues);
  };

  return <PropertyForm 
    {...props}
    onSubmit={handleSubmit} 
  />;
};

export default ProductPropertyForm;
