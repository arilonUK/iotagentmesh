
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { PropertyFormSchema } from '../types';

interface StringValidationFieldProps {
  form: UseFormReturn<PropertyFormSchema>;
}

export function StringValidationField({ form }: StringValidationFieldProps) {
  return (
    <FormField
      control={form.control}
      name="validation_rules.pattern"
      render={({ field }) => (
        <FormItem className="md:col-span-2">
          <FormLabel>Validation Pattern</FormLabel>
          <FormControl>
            <Input 
              placeholder="RegEx pattern (e.g. ^[A-Za-z0-9]+$)" 
              {...field}
              value={field.value === null ? '' : field.value}
              onChange={(e) => field.onChange(e.target.value || null)}
            />
          </FormControl>
          <FormDescription>
            Optional regular expression pattern for validation
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
