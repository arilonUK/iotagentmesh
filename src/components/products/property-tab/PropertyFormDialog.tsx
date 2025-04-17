
import React from 'react';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductProperty, PropertyFormValues } from '@/types/product';
import { PropertyForm } from '../property-form';

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
  
  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <PropertyForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        isLoading={isLoading}
        isEditing={!!defaultValues}
      />
    </DialogContent>
  );
}
