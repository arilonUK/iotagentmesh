
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { EndpointFormData, isEndpointParameters } from '@/types/endpoint';

interface DeviceActionConfigSectionProps {
  form: UseFormReturn<EndpointFormData>;
}

export function DeviceActionConfigSection({ form }: DeviceActionConfigSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="configuration.target_device_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Target Device ID</FormLabel>
            <FormControl>
              <Input placeholder="Device ID to control" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="configuration.action"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Action</FormLabel>
            <FormControl>
              <Input placeholder="toggle_switch" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="configuration.parameters"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Parameters (JSON)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder={'{\n  "value": true\n}'}
                className="min-h-[100px] font-mono"
                value={
                  typeof field.value === 'object'
                    ? JSON.stringify(field.value, null, 2)
                    : field.value || ''
                }
                onChange={(e) => {
                  try {
                    const parsed = e.target.value ? JSON.parse(e.target.value) : {};
                    if (isEndpointParameters(parsed)) {
                      field.onChange(parsed);
                    } else {
                      field.onChange(e.target.value);
                    }
                  } catch {
                    field.onChange(e.target.value);
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
