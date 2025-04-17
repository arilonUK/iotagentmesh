
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from './types';

interface BasicInfoTabProps {
  form: UseFormReturn<ProductFormValues>;
}

export function BasicInfoTab({ form }: BasicInfoTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter product name" />
                </FormControl>
                <FormDescription>
                  Give your product a clear and descriptive name
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Enter product description"
                    className="min-h-[100px] resize-y"
                  />
                </FormControl>
                <FormDescription>
                  Provide a detailed description of your product
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
