
import React from 'react';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductProperty, PropertyFormValues } from '@/types/product';
import ProductPropertyForm from '../ProductPropertyForm';

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
  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <ProductPropertyForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        isLoading={isLoading}
      />
    </DialogContent>
  );
}
