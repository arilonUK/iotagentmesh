
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { EndpointFormData, EndpointType } from '@/types/endpoint';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BasicInfoSection, ConfigurationSection } from './FormSections';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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
    console.log('Form data submitted:', data);
    try {
      onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to save endpoint');
    }
  };

  // Handle endpoint type change
  const handleTypeChange = (type: EndpointType) => {
    console.log('Type changed to:', type);
    setSelectedType(type);
    form.setValue('type', type);
    
    // Reset configuration when type changes
    form.setValue('configuration', {});
  };

  const isEditing = !!initialData?.id;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? 'Edit Endpoint' : 'New Endpoint'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Information */}
            <BasicInfoSection form={form} onTypeChange={handleTypeChange} />

            {/* Type-specific configuration */}
            <ConfigurationSection type={selectedType} form={form} />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Endpoint' : 'Save Endpoint'
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
