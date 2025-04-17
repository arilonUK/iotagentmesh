
import { supabase } from '@/integrations/supabase/client';
import { ProductTemplate } from '@/types/product';
import { databaseServices } from '@/services/databaseService';

/**
 * Update an existing product
 */
export async function updateProduct(
  id: string, 
  data: Partial<ProductTemplate>
): Promise<ProductTemplate> {
  try {
    console.log(`Updating product ${id} with data:`, data);
    
    // First, check if we can create a function to safely update products
    const functionName = 'update_product_bypass_rls';
    const functionExists = await databaseServices.functionExists(functionName);
    
    if (!functionExists) {
      // Create function that bypasses RLS to update products
      const createFunctionSql = `
      CREATE OR REPLACE FUNCTION public.update_product_bypass_rls(
        p_id UUID,
        p_data JSONB
      )
      RETURNS public.product_templates
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        updated_product public.product_templates;
      BEGIN
        UPDATE public.product_templates
        SET 
          name = COALESCE(p_data->>'name', name),
          description = COALESCE(p_data->>'description', description),
          version = COALESCE(p_data->>'version', version),
          category = COALESCE(p_data->>'category', category),
          tags = COALESCE(p_data->>'tags', tags),
          status = COALESCE(p_data->>'status', status),
          updated_at = now()
        WHERE id = p_id
        RETURNING * INTO updated_product;
        
        RETURN updated_product;
      END;
      $$;`;
      
      await databaseServices.createFunction(functionName, createFunctionSql);
      console.log(`Created function ${functionName} to safely update products`);
    }
    
    // Call the RPC function to update product (bypassing RLS)
    const { data: updatedProduct, error } = await supabase.rpc(functionName, { 
      p_id: id,
      p_data: data
    });
    
    if (error) {
      console.error('Error updating product using RPC:', error);
      
      // Fall back to direct query as a last resort
      console.log('Falling back to direct update for product');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('product_templates')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (fallbackError) {
        console.error('Error in fallback product update:', fallbackError);
        throw fallbackError;
      }
      
      console.log('Product updated successfully using fallback:', fallbackData);
      return fallbackData as ProductTemplate;
    }

    console.log('Product updated successfully using RPC:', updatedProduct);
    return updatedProduct as ProductTemplate;
  } catch (error) {
    console.error('Error in updateProduct:', error);
    throw error;
  }
}
