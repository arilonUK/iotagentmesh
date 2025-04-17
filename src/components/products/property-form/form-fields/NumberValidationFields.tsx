
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { PropertyFormSchema } from '../types';

interface NumberValidationFieldsProps {
  form: UseFormReturn<PropertyFormSchema>;
}

export function NumberValidationFields({ form }: NumberValidationFieldsProps) {
  return (
    <div className="md:col-span-2 grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField
        control={form.control}
        name="unit"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Unit</FormLabel>
            <FormControl>
              <Input placeholder="e.g. kg, cm, °C" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="md:col-span-2 grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="validation_rules.min"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Value</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Minimum value" 
                  {...field}
                  value={field.value === null ? '' : field.value}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="validation_rules.max"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Value</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Maximum value" 
                  {...field}
                  value={field.value === null ? '' : field.value}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
