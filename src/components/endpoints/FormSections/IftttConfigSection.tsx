
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { EndpointFormData } from '@/types/endpoint';

interface IftttConfigSectionProps {
  form: UseFormReturn<EndpointFormData>;
}

export function IftttConfigSection({ form }: IftttConfigSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="configuration.webhook_key"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Webhook Key</FormLabel>
            <FormControl>
              <Input placeholder="Your IFTTT webhook key" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="configuration.event_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Event Name</FormLabel>
            <FormControl>
              <Input placeholder="iot_alert" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="configuration.value1"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Value 1 Template</FormLabel>
            <FormControl>
              <Input placeholder="{{device_name}}" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="configuration.value2"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Value 2 Template</FormLabel>
            <FormControl>
              <Input placeholder="{{value}}" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="configuration.value3"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Value 3 Template</FormLabel>
            <FormControl>
              <Input placeholder="{{timestamp}}" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
