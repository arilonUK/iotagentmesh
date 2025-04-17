
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { ProductTemplate } from '@/types/product';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

import { 
  productSchema, 
  ProductFormValues,
  BasicInfoTab,
  DetailsTab,
  FormActions
} from './form';

interface ProductFormProps {
  onSubmit: (data: ProductFormValues) => void;
  isLoading?: boolean;
  defaultValues?: Partial<ProductTemplate>;
}

export function ProductForm({ onSubmit, isLoading = false, defaultValues }: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      version: '1.0',
      status: 'draft',
      ...defaultValues,
    },
  });

  const isEditing = !!defaultValues;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <BasicInfoTab form={form} />
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <DetailsTab form={form} />
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />

        <div className="flex justify-end">
          <FormActions isLoading={isLoading} isEditing={isEditing} />
        </div>
      </form>
    </Form>
  );
}
