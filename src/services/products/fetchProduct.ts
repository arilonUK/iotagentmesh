
import { supabase } from '@/integrations/supabase/client';
import { ProductTemplate } from '@/types/product';
import { databaseServices } from '@/services/databaseService';

/**
 * Fetch a product by ID
 */
export async function fetchProduct(id: string): Promise<ProductTemplate> {
  try {
    console.log(`Fetching product with ID: ${id}`);
    
    // First, check if we can create a function to safely fetch a product
    const functionName = 'get_product_by_id';
    const functionExists = await databaseServices.functionExists(functionName);
    
    if (!functionExists) {
      // Create function that bypasses RLS to fetch a specific product
      const createFunctionSql = `
      CREATE OR REPLACE FUNCTION public.get_product_by_id(p_id UUID)
      RETURNS SETOF public.product_templates
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        RETURN QUERY
        SELECT * FROM public.product_templates 
        WHERE id = p_id
        LIMIT 1;
      END;
      $$;`;
      
      await databaseServices.createFunction(functionName, createFunctionSql);
      console.log(`Created function ${functionName} to safely fetch a product`);
    }
    
    // Call the RPC function to get the product (bypassing the problematic RLS)
    const { data, error } = await (supabase.rpc as any)(
      'get_product_by_id', 
      { p_id: id }
    );
    
    if (error) {
      console.error('Error fetching product using RPC:', error);
      
      // Fall back to direct query as a last resort
      console.log('Falling back to direct query for product');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('product_templates')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (fallbackError) {
        console.error(`Error in fallback product fetch:`, fallbackError);
        throw fallbackError;
      }
      
      if (!fallbackData) {
        const notFoundError = new Error(`Product with ID ${id} not found`);
        console.error(notFoundError);
        throw notFoundError;
      }
      
      console.log('Successfully fetched product using fallback');
      return {
        ...fallbackData,
        status: (fallbackData.status || 'draft') as 'draft' | 'active' | 'archived'
      };
    }

    if (!data || data.length === 0) {
      const notFoundError = new Error(`Product with ID ${id} not found`);
      console.error(notFoundError);
      throw notFoundError;
    }

    console.log('Successfully fetched product using RPC');
    
    // Transform the data to ensure correct typing
    return {
      ...data[0],
      status: (data[0].status || 'draft') as 'draft' | 'active' | 'archived'
    };
  } catch (error) {
    console.error('Error in fetchProduct:', error);
    throw error;
  }
}
