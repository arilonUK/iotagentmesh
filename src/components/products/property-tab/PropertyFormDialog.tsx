
import React from 'react';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductProperty, PropertyFormValues } from '@/types/product';
import { PropertyForm } from '../property-form';
import { PropertyFormValues as FormValues } from '../property-form/types';

interface PropertyFormDialogProps {
  title: string;
  description: string;
  onSubmit: (data: PropertyFormValues) => Promise<void>;
  defaultValues?: ProductProperty;
  isLoading: boolean;
}

export function PropertyFormDialog({
  title,
  description,
  onSubmit,
  defaultValues,
  isLoading
}: PropertyFormDialogProps) {
  console.log("PropertyFormDialog defaultValues:", defaultValues);
  
  // Convert between PropertyFormValues and FormValues if needed
  const handleSubmit = async (data: FormValues): Promise<void> => {
    return onSubmit(data as PropertyFormValues);
  };
  
  return (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <PropertyForm
          onSubmit={handleSubmit}
          defaultValues={defaultValues}
          isLoading={isLoading}
          isEditing={!!defaultValues}
        />
      </div>
    </DialogContent>
  );
}
