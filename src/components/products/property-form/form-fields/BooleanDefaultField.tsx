
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UseFormReturn } from 'react-hook-form';
import { PropertyFormSchema } from '../types';

interface BooleanDefaultFieldProps {
  form: UseFormReturn<PropertyFormSchema>;
}

export function BooleanDefaultField({ form }: BooleanDefaultFieldProps) {
  return (
    <FormField
      control={form.control}
      name="default_value"
      render={({ field }) => (
        <FormItem className="md:col-span-2">
          <FormLabel>Default Value</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={(value) => field.onChange(value === 'true')}
              defaultValue={
                field.value === true
                  ? 'true'
                  : field.value === false
                  ? 'false'
                  : undefined
              }
              className="flex space-x-4"
            >
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <RadioGroupItem value="true" />
                </FormControl>
                <FormLabel className="font-normal">
                  True
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <RadioGroupItem value="false" />
                </FormControl>
                <FormLabel className="font-normal">
                  False
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <RadioGroupItem value="" />
                </FormControl>
                <FormLabel className="font-normal">
                  None
                </FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
