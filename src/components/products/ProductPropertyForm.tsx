
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@/components/ui/switch";
import { PropertyFormValues } from '@/types/product';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const propertyFormSchema = z.object({
  name: z.string().min(1, "Property name is required"),
  description: z.string().optional(),
  data_type: z.enum(["string", "number", "boolean", "location"]),
  unit: z.string().optional(),
  is_required: z.boolean().default(false),
  default_value: z.any().optional(),
  validation_rules: z.object({
    min: z.number().nullable().optional(),
    max: z.number().nullable().optional(),
    pattern: z.string().nullable().optional(),
    options: z.array(z.string()).nullable().optional(),
  }).optional(),
});

type PropertyFormSchema = z.infer<typeof propertyFormSchema>;

interface ProductPropertyFormProps {
  onSubmit: (data: PropertyFormValues) => Promise<void>;
  initialValues?: Partial<PropertyFormValues>;
  isEditing?: boolean;
}

const ProductPropertyForm: React.FC<ProductPropertyFormProps> = ({
  onSubmit,
  initialValues,
  isEditing = false
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PropertyFormSchema>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      name: initialValues?.name || '',
      description: initialValues?.description || '',
      data_type: initialValues?.data_type || 'string',
      unit: initialValues?.unit || '',
      is_required: initialValues?.is_required || false,
      default_value: initialValues?.default_value || '',
      validation_rules: initialValues?.validation_rules || {},
    }
  });

  const dataType = form.watch('data_type');

  const handleFormSubmit = async (values: PropertyFormSchema) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Ensure the form values conform to the PropertyFormValues type
      const formData: PropertyFormValues = {
        name: values.name,
        description: values.description,
        data_type: values.data_type,
        unit: values.unit,
        is_required: values.is_required,
        default_value: values.default_value,
        validation_rules: values.validation_rules,
      };

      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the property');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter property name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="string">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="location">Location</SelectItem>
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
                    <Textarea placeholder="Enter property description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {dataType === 'number' && (
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. kg, cm, °C" {...field} />
                    </FormControl>
                    <FormDescription>
                      Specify the unit of measurement
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="is_required"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Required</FormLabel>
                    <FormDescription>
                      Mark this property as required for the device
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

            {/* Additional validation fields based on data type */}
            {dataType === 'number' && (
              <div className="md:col-span-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="validation_rules.min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Value</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Minimum value" 
                          {...field}
                          value={field.value === null ? '' : field.value}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="validation_rules.max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Value</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Maximum value" 
                          {...field}
                          value={field.value === null ? '' : field.value}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {dataType === 'string' && (
              <FormField
                control={form.control}
                name="validation_rules.pattern"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Validation Pattern</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="RegEx pattern (e.g. ^[A-Za-z0-9]+$)" 
                        {...field}
                        value={field.value === null ? '' : field.value}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional regular expression pattern for validation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {dataType === 'boolean' && (
              <FormField
                control={form.control}
                name="default_value"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Default Value</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(value === 'true')}
                        defaultValue={
                          field.value === true
                            ? 'true'
                            : field.value === false
                            ? 'false'
                            : undefined
                        }
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="true" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            True
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="false" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            False
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            None
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (isEditing ? 'Updating...' : 'Creating...') 
                : (isEditing ? 'Update Property' : 'Create Property')
              }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProductPropertyForm;
