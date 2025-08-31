
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ServiceConfig, ServiceType } from '@/types/product';
import { ServiceConfigFields } from './ServiceConfigFields';

// Schema for the service form
export const serviceFormSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().optional(),
  service_type: z.string().min(1, 'Service type is required'),
  enabled: z.boolean().default(true),
  config: z.record(z.any()).default({})
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;

interface ServiceDefaultValues {
  name?: string;
  description?: string;
  service_type?: string;
  enabled?: boolean;
  config?: Record<string, unknown>;
}

interface ServiceFormProps {
  onSubmit: (data: ServiceFormValues) => Promise<void>;
  defaultValues?: ServiceDefaultValues;
  isLoading?: boolean;
  isEditing?: boolean;
}

export function ServiceForm({ 
  onSubmit, 
  defaultValues, 
  isLoading = false,
  isEditing = false 
}: ServiceFormProps) {
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: defaultValues || {
      name: '',
      description: '',
      service_type: 'mqtt',
      enabled: true,
      config: {}
    }
  });

  const serviceType = form.watch('service_type') as ServiceType;
  
  const handleSubmit = async (values: ServiceFormValues) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Error submitting service form:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
          {/* Basic Service Info */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter service name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="service_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="mqtt">MQTT</SelectItem>
                    <SelectItem value="http">HTTP API</SelectItem>
                    <SelectItem value="data_processing">Data Processing</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                    <SelectItem value="storage">Storage</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter service description" 
                    className="resize-none" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Enabled</FormLabel>
                  <FormDescription>
                    Activate this service for devices using this product template
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Service-specific configuration fields */}
        <ServiceConfigFields 
          serviceType={serviceType} 
          form={form} 
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading
              ? (isEditing ? 'Updating...' : 'Creating...')
              : (isEditing ? 'Update Service' : 'Create Service')
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}
