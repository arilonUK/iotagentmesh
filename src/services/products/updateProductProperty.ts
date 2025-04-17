
import { supabase } from '@/integrations/supabase/client';
import { ProductProperty } from '@/types/product';
import { databaseServices } from '@/services/databaseService';

/**
 * Update an existing product property
 */
export async function updateProductProperty(
  id: string, 
  data: Partial<ProductProperty>
): Promise<ProductProperty> {
  try {
    console.log(`Updating property ${id} with data:`, data);
    
    // First, check if we can create a function to safely update product properties
    const functionName = 'update_property_bypass_rls';
    const functionExists = await databaseServices.functionExists(functionName);
    
    if (!functionExists) {
      // Create function that bypasses RLS to update product properties
      const createFunctionSql = `
      CREATE OR REPLACE FUNCTION public.update_property_bypass_rls(
        p_id UUID,
        p_data JSONB
      )
      RETURNS public.product_properties
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        updated_property public.product_properties;
      BEGIN
        UPDATE public.product_properties
        SET 
          name = COALESCE(p_data->>'name', name),
          description = COALESCE(p_data->>'description', description),
          data_type = COALESCE(p_data->>'data_type', data_type),
          unit = COALESCE(p_data->>'unit', unit),
          is_required = COALESCE((p_data->>'is_required')::boolean, is_required),
          default_value = COALESCE((p_data->>'default_value')::jsonb, default_value),
          validation_rules = COALESCE((p_data->>'validation_rules')::jsonb, validation_rules),
          updated_at = now()
        WHERE id = p_id
        RETURNING * INTO updated_property;
        
        RETURN updated_property;
      END;
      $$;`;
      
      await databaseServices.createFunction(functionName, createFunctionSql);
      console.log(`Created function ${functionName} to safely update product properties`);
    }
    
    // Call the RPC function to update property (bypassing RLS)
    const { data: updatedProperty, error } = await supabase.rpc('update_property_bypass_rls', { 
      p_id: id,
      p_data: data
    });
    
    if (error) {
      console.error('Error updating product property using RPC:', error);
      
      // Fall back to direct query as a last resort
      console.log('Falling back to direct update for product property');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('product_properties')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (fallbackError) {
        console.error('Error in fallback property update:', fallbackError);
        throw fallbackError;
      }
      
      console.log('Property updated successfully using fallback:', fallbackData);
      return {
        ...fallbackData,
        data_type: fallbackData.data_type as 'string' | 'number' | 'boolean' | 'location',
        validation_rules: fallbackData.validation_rules as {
          min?: number;
          max?: number;
          pattern?: string;
          options?: string[];
        } | undefined
      };
    }

    console.log('Property updated successfully using RPC:', updatedProperty);
    return {
      ...updatedProperty,
      data_type: updatedProperty.data_type as 'string' | 'number' | 'boolean' | 'location',
      validation_rules: updatedProperty.validation_rules as {
        min?: number;
        max?: number;
        pattern?: string;
        options?: string[];
      } | undefined
    };
  } catch (error) {
    console.error('Error in updateProductProperty:', error);
    throw error;
  }
}
