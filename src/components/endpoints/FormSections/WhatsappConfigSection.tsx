
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { EndpointFormData } from '@/types/endpoint';

interface WhatsappConfigSectionProps {
  form: UseFormReturn<EndpointFormData>;
}

export function WhatsappConfigSection({ form }: WhatsappConfigSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="configuration.phone_number_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number ID</FormLabel>
            <FormControl>
              <Input placeholder="Your WhatsApp Business Phone Number ID" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="configuration.access_token"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Access Token</FormLabel>
            <FormControl>
              <Input placeholder="Your WhatsApp Business API access token" type="password" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="configuration.to_phone_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>To Phone Number</FormLabel>
            <FormControl>
              <Input placeholder="Phone number with country code (e.g., +1234567890)" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="configuration.message_template"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Message Template</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="🚨 Alert from device {{device_name}}: {{value}}" 
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
