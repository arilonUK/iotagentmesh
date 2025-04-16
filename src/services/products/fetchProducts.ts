
import { supabase } from '@/integrations/supabase/client';
import { ProductTemplate } from '@/types/product';

/**
 * Fetch all products for a specific organization
 */
export async function fetchProducts(organizationId: string): Promise<ProductTemplate[]> {
  try {
    // Use a direct query without relying on RLS policies for organization_members
    const { data, error } = await supabase
      .from('product_templates')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    // Cast the data to ensure it conforms to ProductTemplate type
    return (data || []).map(item => ({
      ...item,
      status: (item.status || 'draft') as 'draft' | 'active' | 'archived'
    }));
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    // Return empty array instead of throwing to avoid breaking the UI
    return [];
  }
}
