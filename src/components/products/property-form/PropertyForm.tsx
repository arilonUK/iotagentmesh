import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PropertyFormProps } from './types';
import { propertyFormSchema } from './schema';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { 
  BasicFields,
  NumberValidationFields,
  StringValidationField,
  BooleanDefaultField
} from './form-fields';
import { ValidationRuleBuilder } from './ValidationRuleBuilder';
import { PropertyDataType } from '@/types/product';

export function PropertyForm({
  onSubmit,
  initialValues,
  isEditing = false,
  defaultValues,
  isLoading = false
}: PropertyFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log("Form defaultValues:", defaultValues);

  const form = useForm({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: defaultValues || {
      name: initialValues?.name || '',
      description: initialValues?.description || '',
      data_type: initialValues?.data_type || 'string',
      unit: initialValues?.unit || '',
      is_required: initialValues?.is_required || false,
      default_value: initialValues?.default_value || '',
      validation_rules: initialValues?.validation_rules || {},
    }
  });

  useEffect(() => {
    if (defaultValues) {
      console.log("Resetting form with defaultValues:", defaultValues);
      
      const validationRules = defaultValues.validation_rules || {};
      
      form.reset({
        ...defaultValues,
        validation_rules: validationRules
      });
    }
  }, [defaultValues, form]);

  const dataType = form.watch('data_type') as PropertyDataType;

  const handleFormSubmit = async (values: any) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log("Submitting form with values:", values);
      await onSubmit(values);
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
          <BasicFields form={form} />

          {/* Enhanced validation rules builder */}
          <ValidationRuleBuilder form={form} dataType={dataType} />

          {/* Legacy validation fields - we'll keep these for backward compatibility */}
          {dataType === 'number' && (
            <NumberValidationFields form={form} />
          )}

          {dataType === 'string' && (
            <StringValidationField form={form} />
          )}

          {dataType === 'boolean' && (
            <BooleanDefaultField form={form} />
          )}

          <div className="flex justify-end space-x-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading
                ? (isEditing ? 'Updating...' : 'Creating...') 
                : (isEditing ? 'Update Property' : 'Create Property')
              }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
