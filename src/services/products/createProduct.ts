
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

    // Create product data object to avoid potential type issues
    const productData = {
      name: product.name,
      description: product.description || null,
      version: product.version || '1.0',
      category: product.category || null,
      tags: product.tags || null,
      status: product.status || 'draft',
      organization_id: product.organization_id
    };
    
    console.log('Final product data being sent to Supabase:', productData);

    // Direct database insert without using RPC
    // This avoids potential RLS and function-related issues
    const { data, error } = await supabase
      .from('product_templates')
      .insert(productData)
      .select()
      .single();

    if (error) {
      console.error('Error creating product in Supabase:', error);
      throw error;
    }

    console.log('Product created successfully in Supabase:', data);
    return {
      ...data,
      status: (data.status || 'draft') as 'draft' | 'active' | 'archived'
    };
  } catch (error) {
    console.error('Error in createProduct:', error);
    throw error;
  }
}
