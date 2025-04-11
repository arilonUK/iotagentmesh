
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { EndpointFormData } from '@/types/endpoint';

interface TelegramConfigSectionProps {
  form: UseFormReturn<EndpointFormData>;
}

export function TelegramConfigSection({ form }: TelegramConfigSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="configuration.bot_token"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bot Token</FormLabel>
            <FormControl>
              <Input placeholder="123456789:ABCDEF..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="configuration.chat_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Chat ID</FormLabel>
            <FormControl>
              <Input placeholder="123456789" {...field} />
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
