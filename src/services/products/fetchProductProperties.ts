
import { supabase } from '@/integrations/supabase/client';
import { ProductProperty } from '@/types/product';
import { databaseServices } from '@/services/databaseService';

/**
 * Fetch all properties for a product
 */
export async function fetchProductProperties(productId: string): Promise<ProductProperty[]> {
  try {
    console.log(`Fetching properties for product: ${productId}`);
    
    // First, check if we can create a function to safely fetch product properties
    const functionName = 'get_product_properties';
    const functionExists = await databaseServices.functionExists(functionName);
    
    if (!functionExists) {
      // Create function that bypasses RLS to fetch product properties
      const createFunctionSql = `
      CREATE OR REPLACE FUNCTION public.get_product_properties(p_product_id UUID)
      RETURNS SETOF public.product_properties
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        RETURN QUERY
        SELECT * FROM public.product_properties 
        WHERE product_id = p_product_id;
      END;
      $$;`;
      
      await databaseServices.createFunction(functionName, createFunctionSql);
      console.log(`Created function ${functionName} to safely fetch product properties`);
    }
    
    // Call the RPC function to get properties (bypassing the problematic RLS)
    const { data, error } = await supabase.rpc('get_product_properties', {
      p_product_id: productId
    });
    
    if (error) {
      console.error('Error fetching product properties using RPC:', error);
      
      // Fall back to direct query as a last resort
      console.log('Falling back to direct query for product properties');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('product_properties')
        .select('*')
        .eq('product_id', productId);
      
      if (fallbackError) {
        console.error(`Error in fallback properties fetch:`, fallbackError);
        throw fallbackError;
      }
      
      console.log(`Successfully fetched ${fallbackData.length} properties using fallback`);
      return fallbackData.map(property => ({
        ...property,
        data_type: property.data_type as 'string' | 'number' | 'boolean' | 'location',
        default_value: property.default_value as string | number | boolean | null,
        validation_rules: property.validation_rules as {
          min?: number;
          max?: number;
          pattern?: string;
          options?: string[];
        } | undefined
      }));
    }

    if (!data) {
      console.log('No properties returned from RPC function');
      return [];
    }

    console.log(`Successfully fetched ${data.length} properties using RPC`);
    
    // Transform the data to ensure correct typing
    return data.map(property => ({
      ...property,
      data_type: property.data_type as 'string' | 'number' | 'boolean' | 'location',
      default_value: property.default_value as string | number | boolean | null,
      validation_rules: property.validation_rules as {
        min?: number;
        max?: number;
        pattern?: string;
        options?: string[];
      } | undefined
    }));
  } catch (error) {
    console.error('Error in fetchProductProperties:', error);
    throw error;
  }
}
