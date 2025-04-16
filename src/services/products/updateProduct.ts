
import { supabase } from '@/integrations/supabase/client';
import { ProductTemplate } from '@/types/product';

/**
 * Update an existing product
 */
export async function updateProduct(
  id: string, 
  data: Partial<ProductTemplate>
): Promise<ProductTemplate> {
  const { data: updatedProduct, error } = await supabase
    .from('product_templates')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }

  return {
    ...updatedProduct,
    status: (updatedProduct.status || 'draft') as 'draft' | 'active' | 'archived'
  };
}
