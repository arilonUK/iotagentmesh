
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
