
import { supabase } from '@/integrations/supabase/client';
import { ProductProperty } from '@/types/product';

/**
 * Create a new property for a product
 */
export async function createProductProperty(
  property: Omit<ProductProperty, 'id' | 'created_at' | 'updated_at'>
): Promise<ProductProperty> {
  const { data, error } = await supabase
    .from('product_properties')
    .insert(property)
    .select()
    .single();

  if (error) {
    console.error('Error creating product property:', error);
    throw error;
  }

  return {
    ...data,
    data_type: data.data_type as 'string' | 'number' | 'boolean' | 'location',
    validation_rules: data.validation_rules as {
      min?: number;
      max?: number;
      pattern?: string;
      options?: string[];
    } | undefined
  };
}
