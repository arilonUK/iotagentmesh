
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { EndpointFormData, EndpointType } from '@/types/endpoint';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BasicInfoSection, ConfigurationSection } from './FormSections';

// Form schema with validation
const endpointFormSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  description: z.string().optional(),
  type: z.enum(['email', 'telegram', 'webhook', 'device_action', 'ifttt', 'whatsapp']),
  enabled: z.boolean().default(true),
  configuration: z.record(z.any())
});

type EndpointFormProps = {
  initialData?: Partial<EndpointFormData>;
  onSubmit: (data: EndpointFormData) => void;
  isSubmitting?: boolean;
};

export default function EndpointForm({ initialData, onSubmit, isSubmitting = false }: EndpointFormProps) {
  const [selectedType, setSelectedType] = useState<EndpointType>(
    initialData?.type || 'webhook'
  );

  // Initialize form with defaults or initial data
  const form = useForm<EndpointFormData>({
    resolver: zodResolver(endpointFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      type: initialData?.type || 'webhook',
      enabled: initialData?.enabled !== undefined ? initialData.enabled : true,
      configuration: initialData?.configuration || {},
    },
  });

  // Handle form submission
  const handleSubmit = (data: EndpointFormData) => {
    onSubmit(data);
  };

  // Handle endpoint type change
  const handleTypeChange = (type: EndpointType) => {
    setSelectedType(type);
    form.setValue('type', type);
    
    // Reset configuration when type changes
    form.setValue('configuration', {});
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Endpoint Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Information */}
            <BasicInfoSection form={form} onTypeChange={handleTypeChange} />

            {/* Type-specific configuration */}
            <ConfigurationSection type={selectedType} form={form} />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline">Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Endpoint'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
