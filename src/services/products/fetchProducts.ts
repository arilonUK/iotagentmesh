
import { supabase } from '@/integrations/supabase/client';
import { ProductTemplate } from '@/types/product';

/**
 * Fetch all products for an organization
 */
export async function fetchProducts(organizationId: string): Promise<ProductTemplate[]> {
  try {
    console.log(`Fetching products for organization: ${organizationId}`);
    
    // Use direct query with organizationId filter
    const { data, error } = await supabase
      .from('product_templates')
      .select('*')
      .eq('organization_id', organizationId);
    
    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    console.log(`Successfully fetched ${data.length} products`);
    
    // Transform the data to ensure correct typing
    return data.map(product => ({
      ...product,
      status: (product.status || 'draft') as 'draft' | 'active' | 'archived'
    }));
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    throw error;
  }
}
