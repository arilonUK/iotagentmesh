
import { supabase } from '@/integrations/supabase/client';
import { ProductTemplate } from '@/types/product';

/**
 * Create a new product
 */
export async function createProduct(
  product: Omit<ProductTemplate, 'id' | 'created_at' | 'updated_at'>
): Promise<ProductTemplate> {
  try {
    console.log('Creating product with data:', product);
    
    // Ensure organization_id is present
    if (!product.organization_id) {
      const error = new Error('Organization ID is required');
      console.error(error);
      throw error;
    }

    console.log('Organization ID is valid:', product.organization_id);

    // Use our new RPC function to bypass RLS
    console.log('Calling create_product_bypass_rls RPC function');
    const { data, error } = await supabase.rpc(
      'create_product_bypass_rls',
      {
        p_name: product.name,
        p_description: product.description || null,
        p_version: product.version || '1.0',
        p_category: product.category || null,
        p_tags: product.tags || null,
        p_status: product.status || 'draft',
        p_organization_id: product.organization_id
      }
    );

    if (error) {
      console.error('Error creating product with RPC:', error);
      
      // Fall back to direct database insert if RPC fails
      console.log('Falling back to direct insert');
      const productData = {
        name: product.name,
        description: product.description || null,
        version: product.version || '1.0',
        category: product.category || null,
        tags: product.tags || null,
        status: product.status || 'draft',
        organization_id: product.organization_id
      };
      
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('product_templates')
        .insert(productData)
        .select()
        .single();

      if (fallbackError) {
        console.error('Error in fallback product creation:', fallbackError);
        throw fallbackError;
      }

      console.log('Product created successfully with fallback:', fallbackData);
      return {
        ...fallbackData,
        status: (fallbackData.status || 'draft') as 'draft' | 'active' | 'archived'
      };
    }

    console.log('Product created successfully with RPC:', data);
    return {
      ...data,
      status: (data.status || 'draft') as 'draft' | 'active' | 'archived'
    };
  } catch (error) {
    console.error('Error in createProduct:', error);
    throw error;
  }
}
