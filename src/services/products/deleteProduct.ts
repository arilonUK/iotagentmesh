
import { supabase } from '@/integrations/supabase/client';

/**
 * Delete a product by ID
 */
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('product_templates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}
