
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { EndpointFormData } from '@/types/endpoint';

interface EmailConfigSectionProps {
  form: UseFormReturn<EndpointFormData>;
}

export function EmailConfigSection({ form }: EmailConfigSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="configuration.to"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Recipients (comma-separated)</FormLabel>
            <FormControl>
              <Input 
                placeholder="email@example.com, otheremail@example.com" 
                value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}
                onChange={(e) => {
                  const emails = e.target.value.split(',').map(email => email.trim());
                  field.onChange(emails);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="configuration.subject"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subject</FormLabel>
            <FormControl>
              <Input placeholder="Alert from IoT Device" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="configuration.body_template"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email Body Template</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Device {{device_name}} reported value: {{value}}" 
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
