
import { supabase } from '@/integrations/supabase/client';
import { PropertyTemplate, PropertyDataType } from '@/types/product';
import { databaseServices } from '@/services/databaseService';

/**
 * Fetch all property templates for an organization
 */
export async function fetchPropertyTemplates(organizationId: string): Promise<PropertyTemplate[]> {
  try {
    console.log(`Fetching property templates for organization: ${organizationId}`);
    
    // Use the product_templates table since we know it exists in the database schema
    const { data, error } = await supabase
      .from('product_templates')
      .select()
      .eq('organization_id', organizationId)
      .order('name');
    
    if (error) {
      console.error('Error fetching property templates:', error);
      throw error;
    }
    
    console.log(`Successfully fetched ${data?.length || 0} templates`);
    
    // Transform product_templates data to match PropertyTemplate structure
    return (data || []).map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      data_type: 'string', // Default value since product_templates might not have this field
      unit: '',
      is_required: false,
      default_value: null,
      validation_rules: {},
      category: template.category,
      organization_id: template.organization_id,
      created_at: template.created_at,
      updated_at: template.updated_at
    })) as PropertyTemplate[];
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
    
    // Use product_templates table since it exists in the schema
    const { data, error } = await supabase
      .from('product_templates')
      .insert({
        name: template.name,
        description: template.description,
        category: template.category || 'general',
        organization_id: template.organization_id,
        // We'll store the property-specific data in metadata fields
        tags: JSON.stringify({
          data_type: template.data_type,
          unit: template.unit,
          is_required: template.is_required,
          default_value: template.default_value,
          validation_rules: template.validation_rules
        })
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating property template:', error);
      throw error;
    }
    
    console.log('Property template created successfully:', data);
    
    // Convert back to PropertyTemplate format
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      data_type: template.data_type,
      unit: template.unit,
      is_required: template.is_required,
      default_value: template.default_value,
      validation_rules: template.validation_rules,
      category: data.category,
      organization_id: data.organization_id,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
    
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
    
    // First get the existing template
    const { data: existingTemplate, error: fetchError } = await supabase
      .from('product_templates')
      .select()
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching existing property template:', fetchError);
      throw fetchError;
    }
    
    // Get existing metadata from tags field, or use empty defaults
    let metadata = {};
    try {
      metadata = existingTemplate.tags ? JSON.parse(existingTemplate.tags) : {};
    } catch (e) {
      console.warn('Could not parse existing tags as JSON:', e);
    }
    
    // Update metadata with new values, if provided
    if (data.data_type) metadata = { ...metadata, data_type: data.data_type };
    if (data.unit !== undefined) metadata = { ...metadata, unit: data.unit };
    if (data.is_required !== undefined) metadata = { ...metadata, is_required: data.is_required };
    if (data.default_value !== undefined) metadata = { ...metadata, default_value: data.default_value };
    if (data.validation_rules) metadata = { ...metadata, validation_rules: data.validation_rules };
    
    // Prepare update payload
    const updatePayload: Record<string, unknown> = {
      tags: JSON.stringify(metadata)
    };
    
    // Add standard fields if provided
    if (data.name) updatePayload.name = data.name;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.category) updatePayload.category = data.category;
    
    // Perform update
    const { data: updatedTemplate, error } = await supabase
      .from('product_templates')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating property template:', error);
      throw error;
    }
    
    console.log('Property template updated successfully:', updatedTemplate);
    
    // Parse metadata from tags
    let parsedMetadata = {};
    try {
      parsedMetadata = updatedTemplate.tags ? JSON.parse(updatedTemplate.tags) : {};
    } catch (e) {
      console.warn('Could not parse tags as JSON:', e);
    }
    
    // Return in PropertyTemplate format
    return {
      id: updatedTemplate.id,
      name: updatedTemplate.name,
      description: updatedTemplate.description,
      data_type: ((parsedMetadata as Record<string, unknown>).data_type as PropertyDataType) || 'string',
      unit: (parsedMetadata as Record<string, unknown>).unit as string || '',
      is_required: (parsedMetadata as Record<string, unknown>).is_required as boolean || false,
      default_value: (parsedMetadata as Record<string, unknown>).default_value as string | number | boolean || null,
      validation_rules: (parsedMetadata as Record<string, unknown>).validation_rules as Record<string, unknown> || {},
      category: updatedTemplate.category,
      organization_id: updatedTemplate.organization_id,
      created_at: updatedTemplate.created_at,
      updated_at: updatedTemplate.updated_at
    };
    
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
    
    // Use product_templates table since it exists in the schema
    const { error } = await supabase
      .from('product_templates')
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
): Promise<unknown> {
  try {
    console.log(`Applying template ${templateId} to product ${productId}`);
    
    // First get the template
    const { data: template, error: templateError } = await supabase
      .from('product_templates')
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
    
    // Parse metadata from tags
    let metadata = {};
    try {
      metadata = template.tags ? JSON.parse(template.tags) : {};
    } catch (e) {
      console.warn('Could not parse tags as JSON:', e);
      metadata = {};
    }
    
    // Create a property based on the template
    const propertyData = {
      product_id: productId,
      name: template.name,
      description: template.description,
      data_type: ((metadata as Record<string, unknown>).data_type as PropertyDataType) || 'string',
      unit: (metadata as Record<string, unknown>).unit as string || '',
      is_required: (metadata as Record<string, unknown>).is_required as boolean || false,
      default_value: (metadata as Record<string, unknown>).default_value as string | number | boolean || null,
      validation_rules: JSON.stringify((metadata as Record<string, unknown>).validation_rules || {}),
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
