
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '../FileStorageProfileFormSchema';

interface BasicInfoSectionProps {
  form: UseFormReturn<FormValues>;
  readOnly?: boolean;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ 
  form, 
  readOnly = false 
}) => {
  return (
    <>
      {form.getValues('id') && (
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Storage ID</FormLabel>
              <FormControl>
                <Input readOnly value={field.value} />
              </FormControl>
              <FormDescription>
                The unique identifier for this storage profile
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Storage Name</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Device Firmware" {...field} readOnly={readOnly} />
            </FormControl>
            <FormDescription>
              A mnemonic name for this storage profile
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
            <FormLabel>Storage Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describe the purpose of this storage profile" 
                {...field} 
                readOnly={readOnly}
              />
            </FormControl>
            <FormDescription>
              Additional information about this storage profile
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="path"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Storage Path</FormLabel>
            <FormControl>
              <Input placeholder="e.g., firmware/v1" {...field} readOnly={readOnly} />
            </FormControl>
            <FormDescription>
              The path within the storage system
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
