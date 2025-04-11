
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { EndpointFormData } from '@/types/endpoint';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WebhookConfigSectionProps {
  form: UseFormReturn<EndpointFormData>;
}

export function WebhookConfigSection({ form }: WebhookConfigSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="configuration.url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Webhook URL</FormLabel>
            <FormControl>
              <Input placeholder="https://example.com/api/webhook" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="configuration.method"
        render={({ field }) => (
          <FormItem>
            <FormLabel>HTTP Method</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value || 'POST'}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select HTTP method" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="configuration.headers"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Headers (JSON)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder={'{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer token"\n}'}
                className="min-h-[100px] font-mono"
                value={typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : field.value || ''}
                onChange={(e) => {
                  try {
                    const headers = e.target.value ? JSON.parse(e.target.value) : {};
                    field.onChange(headers);
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

      <FormField
        control={form.control}
        name="configuration.body_template"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Body Template (JSON)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder={'{\n  "device": "{{device_id}}",\n  "value": {{value}},\n  "timestamp": "{{timestamp}}"\n}'}
                className="min-h-[100px] font-mono"
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
