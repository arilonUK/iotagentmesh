
import { supabase } from '@/integrations/supabase/client';
import { ProductProperty } from '@/types/product';

/**
 * Fetch all properties for a product
 */
export async function fetchProductProperties(productId: string): Promise<ProductProperty[]> {
  try {
    console.log(`Fetching properties for product: ${productId}`);
    
    const { data, error } = await supabase
      .from('product_properties')
      .select('*')
      .eq('product_id', productId);
    
    if (error) {
      console.error(`Error fetching properties for product ${productId}:`, error);
      throw error;
    }

    console.log(`Successfully fetched ${data.length} properties for product ${productId}`);
    
    // Transform the data to ensure correct typing
    return data.map(property => ({
      ...property,
      data_type: property.data_type as 'string' | 'number' | 'boolean' | 'location',
      validation_rules: property.validation_rules as {
        min?: number;
        max?: number;
        pattern?: string;
        options?: string[];
      } | undefined
    }));
  } catch (error) {
    console.error('Error in fetchProductProperties:', error);
    throw error;
  }
}
