
import { supabase } from '@/integrations/supabase/client';
import { ProductTemplate } from '@/types/product';

/**
 * Fetch a product by ID
 */
export async function fetchProduct(id: string): Promise<ProductTemplate> {
  try {
    console.log(`Fetching product with ID: ${id}`);
    
    // Use direct query with id filter
    const { data, error } = await supabase
      .from('product_templates')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
    
    if (!data) {
      const notFoundError = new Error(`Product with ID ${id} not found`);
      console.error(notFoundError);
      throw notFoundError;
    }

    console.log('Successfully fetched product:', data);
    
    // Transform the data to ensure correct typing
    return {
      ...data,
      status: (data.status || 'draft') as 'draft' | 'active' | 'archived'
    };
  } catch (error) {
    console.error('Error in fetchProduct:', error);
    throw error;
  }
}
