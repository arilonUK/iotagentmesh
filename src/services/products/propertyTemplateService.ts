
import { supabase } from '@/integrations/supabase/client';
import { PropertyTemplate } from '@/types/product';
import { databaseServices } from '@/services/databaseService';

/**
 * Fetch all property templates for an organization
 */
export async function fetchPropertyTemplates(organizationId: string): Promise<PropertyTemplate[]> {
  try {
    console.log(`Fetching property templates for organization: ${organizationId}`);
    
    // First, check if we can create a function to safely fetch property templates
    const functionName = 'get_property_templates';
    const functionExists = await databaseServices.functionExists(functionName);
    
    if (!functionExists) {
      // Create function that bypasses RLS to fetch property templates
      const createFunctionSql = `
      CREATE OR REPLACE FUNCTION public.get_property_templates(p_organization_id UUID)
      RETURNS SETOF public.property_templates
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        RETURN QUERY
        SELECT * FROM public.property_templates 
        WHERE organization_id = p_organization_id
        ORDER BY name ASC;
      END;
      $$;`;
      
      await databaseServices.createFunction(functionName, createFunctionSql);
      console.log(`Created function ${functionName} to safely fetch property templates`);
    }
    
    // Call the RPC function to get templates (bypassing RLS if needed)
    const { data, error } = await supabase
      .rpc(functionName, { p_organization_id: organizationId });
    
    if (error) {
      console.error('Error fetching property templates using RPC:', error);
      
      // Fall back to direct query for property templates
      console.log('Falling back to direct query for property templates');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('property_templates')
        .select();
      
      if (fallbackError) {
        console.error(`Error in fallback templates fetch:`, fallbackError);
        throw fallbackError;
      }
      
      console.log(`Successfully fetched ${fallbackData?.length || 0} templates using fallback`);
      return fallbackData as PropertyTemplate[] || [];
    }

    console.log(`Successfully fetched ${data?.length || 0} templates using RPC`);
    return data as PropertyTemplate[] || [];
    
  } catch (error) {
    console.error('Error in fetchPropertyTemplates:', error);
    throw error;
  }
}

/**
 * Create a new property template
 */
export async function createPropertyTemplate(
  template: Omit<PropertyTemplate, 'id' | 'created_at' | 'updated_at'>
): Promise<PropertyTemplate> {
  try {
    console.log('Creating property template:', template);
    
    const { data, error } = await supabase
      .from('property_templates')
      .insert(template)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating property template:', error);
      throw error;
    }
    
    console.log('Property template created successfully:', data);
    return data as PropertyTemplate;
    
  } catch (error) {
    console.error('Error in createPropertyTemplate:', error);
    throw error;
  }
}

/**
 * Update an existing property template
 */
export async function updatePropertyTemplate(
  id: string, 
  data: Partial<PropertyTemplate>
): Promise<PropertyTemplate> {
  try {
    console.log(`Updating property template ${id} with data:`, data);
    
    const { data: updatedTemplate, error } = await supabase
      .from('property_templates')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating property template:', error);
      throw error;
    }
    
    console.log('Property template updated successfully:', updatedTemplate);
    return updatedTemplate as PropertyTemplate;
    
  } catch (error) {
    console.error('Error in updatePropertyTemplate:', error);
    throw error;
  }
}

/**
 * Delete a property template
 */
export async function deletePropertyTemplate(id: string): Promise<void> {
  try {
    console.log(`Deleting property template with ID: ${id}`);
    
    const { error } = await supabase
      .from('property_templates')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting property template:', error);
      throw error;
    }
    
    console.log('Property template deleted successfully');
    
  } catch (error) {
    console.error('Error in deletePropertyTemplate:', error);
    throw error;
  }
}

/**
 * Apply a template to create a new property
 */
export async function applyTemplateToProduct(
  templateId: string,
  productId: string
): Promise<any> {
  try {
    console.log(`Applying template ${templateId} to product ${productId}`);
    
    // First get the template
    const { data: template, error: templateError } = await supabase
      .from('property_templates')
      .select()
      .eq('id', templateId)
      .single();
    
    if (templateError) {
      console.error('Error fetching property template:', templateError);
      throw templateError;
    }
    
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }
    
    // Create a property based on the template
    const propertyData = {
      product_id: productId,
      name: template.name,
      description: template.description,
      data_type: template.data_type,
      unit: template.unit,
      is_required: template.is_required,
      default_value: template.default_value,
      validation_rules: template.validation_rules,
      is_template: true,
      template_id: templateId
    };
    
    const { data: newProperty, error } = await supabase
      .from('product_properties')
      .insert(propertyData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating property from template:', error);
      throw error;
    }
    
    console.log('Property created from template successfully:', newProperty);
    return newProperty;
    
  } catch (error) {
    console.error('Error in applyTemplateToProduct:', error);
    throw error;
  }
}

export const propertyTemplateService = {
  fetchPropertyTemplates,
  createPropertyTemplate,
  updatePropertyTemplate,
  deletePropertyTemplate,
  applyTemplateToProduct
};
