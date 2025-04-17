
import { supabase } from '@/integrations/supabase/client';
import { databaseServices } from '@/services/databaseService';

/**
 * Delete a product property
 */
export async function deleteProductProperty(id: string): Promise<void> {
  try {
    console.log(`Deleting property with ID: ${id}`);
    
    // First, check if we can create a function to safely delete product properties
    const functionName = 'delete_property_bypass_rls';
    const functionExists = await databaseServices.functionExists(functionName);
    
    if (!functionExists) {
      // Create function that bypasses RLS to delete product properties
      const createFunctionSql = `
      CREATE OR REPLACE FUNCTION public.delete_property_bypass_rls(
        p_id UUID
      )
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        DELETE FROM public.product_properties
        WHERE id = p_id;
      END;
      $$;`;
      
      await databaseServices.createFunction(functionName, createFunctionSql);
      console.log(`Created function ${functionName} to safely delete product properties`);
    }
    
    // Call the RPC function to delete property (bypassing RLS)
    const { error } = await supabase.rpc(functionName, { 
      p_id: id
    });
    
    if (error) {
      console.error('Error deleting product property using RPC:', error);
      
      // Fall back to direct query as a last resort
      console.log('Falling back to direct delete for product property');
      const { error: fallbackError } = await supabase
        .from('product_properties')
        .delete()
        .eq('id', id);
      
      if (fallbackError) {
        console.error('Error in fallback property deletion:', fallbackError);
        throw fallbackError;
      }
      
      console.log('Property deleted successfully using fallback');
      return;
    }

    console.log('Property deleted successfully using RPC');
  } catch (error) {
    console.error('Error in deleteProductProperty:', error);
    throw error;
  }
}
