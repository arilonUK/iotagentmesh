
import { supabase } from '@/integrations/supabase/client';

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
