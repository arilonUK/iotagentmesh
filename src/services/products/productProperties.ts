
import { supabase } from '@/integrations/supabase/client';
import { ProductProperty } from '@/types/product';

/**
 * Fetch all properties for a specific product
 */
export async function fetchProductProperties(productId: string): Promise<ProductProperty[]> {
  const { data, error } = await supabase
    .from('product_properties')
    .select('*')
    .eq('product_id', productId);

  if (error) {
    console.error('Error fetching product properties:', error);
    throw error;
  }

  // Map the data to ensure properties conform to the expected types
  return (data || []).map(property => ({
    ...property,
    data_type: property.data_type as 'string' | 'number' | 'boolean' | 'location',
    validation_rules: property.validation_rules as { 
      min?: number; 
      max?: number; 
      pattern?: string; 
      options?: string[] 
    } | undefined
  }));
}

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

/**
 * Delete a product property
 */
export async function deleteProductProperty(id: string): Promise<void> {
  const { error } = await supabase
    .from('product_properties')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product property:', error);
    throw error;
  }
}
