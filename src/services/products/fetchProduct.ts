
import { supabase } from '@/integrations/supabase/client';
import { ProductTemplate } from '@/types/product';

/**
 * Fetch a single product by ID
 */
export async function fetchProduct(id: string): Promise<ProductTemplate> {
  const { data, error } = await supabase
    .from('product_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    throw error;
  }

  // Cast the data to ensure it conforms to ProductTemplate type
  return {
    ...data,
    status: (data.status || 'draft') as 'draft' | 'active' | 'archived'
  };
}
