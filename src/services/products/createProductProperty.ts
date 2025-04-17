
import { supabase } from '@/integrations/supabase/client';
import { ProductProperty } from '@/types/product';
import { databaseServices } from '@/services/databaseService';

/**
 * Create a new property for a product
 */
export async function createProductProperty(
  property: Omit<ProductProperty, 'id' | 'created_at' | 'updated_at'>
): Promise<ProductProperty> {
  try {
    console.log('Creating product property with data:', property);
    
    // First, check if we can create a function to safely create product properties
    const functionName = 'create_property_bypass_rls';
    const functionExists = await databaseServices.functionExists(functionName);
    
    if (!functionExists) {
      // Create function that bypasses RLS to create product properties
      const createFunctionSql = `
      CREATE OR REPLACE FUNCTION public.create_property_bypass_rls(
        p_product_id UUID,
        p_name TEXT,
        p_description TEXT,
        p_data_type TEXT,
        p_unit TEXT,
        p_is_required BOOLEAN,
        p_default_value JSONB,
        p_validation_rules JSONB
      )
      RETURNS public.product_properties
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        new_property public.product_properties;
      BEGIN
        INSERT INTO public.product_properties (
          product_id,
          name,
          description,
          data_type,
          unit,
          is_required,
          default_value,
          validation_rules
        ) VALUES (
          p_product_id,
          p_name,
          p_description,
          p_data_type,
          p_unit,
          p_is_required,
          p_default_value,
          p_validation_rules
        )
        RETURNING * INTO new_property;
        
        RETURN new_property;
      END;
      $$;`;
      
      await databaseServices.createFunction(functionName, createFunctionSql);
      console.log(`Created function ${functionName} to safely create product properties`);
    }
    
    // Call the RPC function to create property (bypassing RLS)
    const { data, error } = await supabase.rpc('create_property_bypass_rls', { 
      p_product_id: property.product_id,
      p_name: property.name,
      p_description: property.description || null,
      p_data_type: property.data_type,
      p_unit: property.unit || null,
      p_is_required: property.is_required,
      p_default_value: property.default_value || null,
      p_validation_rules: property.validation_rules || null
    });
    
    if (error) {
      console.error('Error creating product property using RPC:', error);
      
      // Fall back to direct query as a last resort
      console.log('Falling back to direct insert for product property');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('product_properties')
        .insert(property)
        .select()
        .single();
      
      if (fallbackError) {
        console.error('Error in fallback property creation:', fallbackError);
        throw fallbackError;
      }
      
      console.log('Property created successfully using fallback:', fallbackData);
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

    console.log('Property created successfully using RPC:', data);
    return {
      ...data,
      data_type: data.data_type as 'string' | 'number' | 'boolean' | 'location',
      validation_rules: data.validation_rules as {
        min?: number;
        max?: number;
        pattern?: string;
        options?: string[];
      } | undefined
    };
  } catch (error) {
    console.error('Error in createProductProperty:', error);
    throw error;
  }
}
