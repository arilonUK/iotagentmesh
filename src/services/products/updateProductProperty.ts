
import { supabase } from '@/integrations/supabase/client';
import { ProductProperty } from '@/types/product';

/**
 * Update an existing product property
 */
export async function updateProductProperty(
  id: string, 
  data: Partial<ProductProperty>
): Promise<ProductProperty> {
  const { data: updatedProperty, error } = await supabase
    .from('product_properties')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product property:', error);
    throw error;
  }

  return {
    ...updatedProperty,
    data_type: updatedProperty.data_type as 'string' | 'number' | 'boolean' | 'location',
    validation_rules: updatedProperty.validation_rules as {
      min?: number;
      max?: number;
      pattern?: string;
      options?: string[];
    } | undefined
  };
}
