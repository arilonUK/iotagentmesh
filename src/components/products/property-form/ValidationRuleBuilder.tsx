
import React from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { PropertyDataType } from '@/types/product';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash } from 'lucide-react';

interface ValidationRuleBuilderProps {
  form: UseFormReturn<any>;
  dataType: PropertyDataType;
}

export function ValidationRuleBuilder({ form, dataType }: ValidationRuleBuilderProps) {
  // Get the current validation rules
  const validationRules = form.watch('validation_rules') || {};
  
  // Function to add an enum option
  const addEnumOption = () => {
    const currentOptions = validationRules.options || [];
    form.setValue('validation_rules.options', [...currentOptions, '']);
  };
  
  // Function to remove an enum option
  const removeEnumOption = (index: number) => {
    const currentOptions = validationRules.options || [];
    form.setValue(
      'validation_rules.options',
      currentOptions.filter((_: string, i: number) => i !== index)
    );
  };
  
  // Render different validation rules based on data type
  const renderValidationRules = () => {
    switch (dataType) {
      case 'number':
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="validation_rules.min"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Value</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Min value" 
                      {...field} 
                      value={field.value || ''} 
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
                      placeholder="Max value" 
                      {...field} 
                      value={field.value || ''} 
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="validation_rules.precision"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Decimal Precision</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Decimal places" 
                      min="0"
                      max="10"
                      {...field} 
                      value={field.value || ''} 
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormDescription>Number of decimal places</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
        
      case 'string':
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="validation_rules.min_length"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Length</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Min length" 
                      {...field} 
                      value={field.value || ''} 
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="validation_rules.max_length"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Length</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Max length" 
                      {...field} 
                      value={field.value || ''} 
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="validation_rules.pattern"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Pattern (RegEx)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Regular expression pattern" 
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormDescription>Validate using a regular expression</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="validation_rules.format"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Format</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., email, url, date" 
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormDescription>Common format like email, url, etc.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
        
      case 'enum':
        // Handle enum validation (allowed options)
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>Enum Options</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEnumOption}
                className="flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Option
              </Button>
            </div>
            
            {(validationRules.options || []).map((option: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name={`validation_rules.options.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input 
                          placeholder={`Option ${index + 1}`} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEnumOption(index)}
                  className="h-9 w-9 shrink-0"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {(validationRules.options || []).length === 0 && (
              <p className="text-sm text-muted-foreground">
                No options added. Add options to create an enumeration.
              </p>
            )}
          </div>
        );
        
      case 'datetime':
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="validation_rules.min"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local" 
                      {...field} 
                      value={field.value || ''} 
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
                  <FormLabel>Max Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local" 
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
        
      case 'json':
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="validation_rules.schema"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>JSON Schema</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="JSON schema definition" 
                      className="min-h-[150px] font-mono text-sm"
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormDescription>
                    Define a JSON schema for validation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
        
      case 'location':
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="validation_rules.format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Format</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., lat-long, geojson" 
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormDescription>Location format specification</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
        
      default:
        return (
          <div className="text-sm text-muted-foreground py-2">
            No validation rules available for this data type.
          </div>
        );
    }
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-sm font-medium mb-3">Validation Rules</h3>
        <Separator className="mb-4" />
        {renderValidationRules()}
      </CardContent>
    </Card>
  );
}
