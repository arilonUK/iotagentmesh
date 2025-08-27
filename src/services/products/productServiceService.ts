
import { supabase } from '@/integrations/supabase/client';
import { ProductService, ServiceFormValues } from '@/types/product';
import { databaseServices } from '@/services/databaseService';
import { createAuditLog } from '@/services/audit';

/**
 * Fetch all services for a product
 */
export async function fetchProductServices(productId: string): Promise<ProductService[]> {
  try {
    console.log(`Fetching services for product: ${productId}`);
    
    // First, check if we can create a function to safely fetch product services
    const functionName = 'get_product_services';
    const functionExists = await databaseServices.functionExists(functionName);
    
    if (!functionExists) {
      // Create function that bypasses RLS to fetch product services
      const createFunctionSql = `
      CREATE OR REPLACE FUNCTION public.get_product_services(p_product_id UUID)
      RETURNS SETOF public.product_services
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        RETURN QUERY
        SELECT * FROM public.product_services 
        WHERE product_id = p_product_id
        ORDER BY name ASC;
      END;
      $$;`;
      
      await databaseServices.createFunction(functionName, createFunctionSql);
      console.log(`Created function ${functionName} to safely fetch product services`);
    }
    
    // Call the RPC function to get services
    const { data, error } = await (supabase.rpc as any)(
      'get_product_services', 
      { p_product_id: productId }
    );
    
    if (error) {
      console.error('Error fetching product services using RPC:', error);
      
      // Fall back to direct query
      console.log('Falling back to direct query for product services');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('product_services')
        .select('*')
        .eq('product_id', productId)
        .order('name');
      
      if (fallbackError) {
        console.error(`Error in fallback services fetch:`, fallbackError);
        throw fallbackError;
      }
      
      console.log(`Successfully fetched ${fallbackData.length} services using fallback`);
      return fallbackData as ProductService[];
    }

    console.log(`Successfully fetched ${data?.length || 0} services using RPC`);
    return data as ProductService[] || [];
    
  } catch (error) {
    console.error('Error in fetchProductServices:', error);
    throw error;
  }
}

/**
 * Create a new service for a product
 */
export async function createProductService(
  service: ServiceFormValues & { product_id: string; organization_id: string }
): Promise<ProductService> {
  try {
    console.log('Creating product service:', service);
    
    // Get organization ID from the product
    const { data: product, error: productError } = await supabase
      .from('product_templates')
      .select('organization_id')
      .eq('id', service.product_id)
      .single();
    
    if (productError) {
      console.error('Error fetching product for organization ID:', productError);
      throw productError;
    }

    const organizationId = product.organization_id;
    
    const { data, error } = await supabase
      .from('product_services')
      .insert({
        ...service,
        config: service.config as any // Cast to Json for Supabase
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product service:', error);
      throw error;
    }
    
    // Log the action
    await createAuditLog(organizationId, 'service_created', {
      service_id: data.id,
      service_name: service.name,
      service_type: service.service_type,
      product_id: service.product_id
    });
    
    console.log('Product service created successfully:', data);
    return data as ProductService;
    
  } catch (error) {
    console.error('Error in createProductService:', error);
    throw error;
  }
}

/**
 * Update an existing product service
 */
export async function updateProductService(
  id: string, 
  data: Partial<ProductService>
): Promise<ProductService> {
  try {
    console.log(`Updating product service ${id} with data:`, data);
    
    // Get organization ID from the service record
    const { data: service, error: serviceError } = await supabase
      .from('product_services')
      .select('*, product_templates!inner(organization_id)')
      .eq('id', id)
      .single();
    
    if (serviceError) {
      console.error('Error fetching service for organization ID:', serviceError);
      throw serviceError;
    }

    const organizationId = service.product_templates.organization_id;
    
    const { data: updatedService, error } = await supabase
      .from('product_services')
      .update({
        ...data,
        config: data.config ? (data.config as any) : undefined // Cast to Json for Supabase
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating product service:', error);
      throw error;
    }
    
    // Log the action
    await createAuditLog(organizationId, 'service_updated', {
      service_id: id,
      service_name: updatedService.name,
      service_type: updatedService.service_type,
      updated_fields: Object.keys(data)
    });
    
    console.log('Product service updated successfully:', updatedService);
    return updatedService as ProductService;
    
  } catch (error) {
    console.error('Error in updateProductService:', error);
    throw error;
  }
}

/**
 * Delete a product service
 */
export async function deleteProductService(id: string): Promise<void> {
  try {
    console.log(`Deleting product service with ID: ${id}`);
    
    // Get organization ID from the service record
    const { data: service, error: serviceError } = await supabase
      .from('product_services')
      .select('*, product_templates!inner(organization_id)')
      .eq('id', id)
      .single();
    
    if (serviceError) {
      console.error('Error fetching service for organization ID:', serviceError);
      throw serviceError;
    }

    const organizationId = service.product_templates.organization_id;
    const serviceName = service.name;
    const serviceType = service.service_type;
    const productId = service.product_id;
    
    const { error } = await supabase
      .from('product_services')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product service:', error);
      throw error;
    }
    
    // Log the action
    await createAuditLog(organizationId, 'service_deleted', {
      service_id: id,
      service_name: serviceName,
      service_type: serviceType,
      product_id: productId
    });
    
    console.log('Product service deleted successfully');
    
  } catch (error) {
    console.error('Error in deleteProductService:', error);
    throw error;
  }
}

/**
 * Toggle service activation status
 */
export async function toggleServiceActivation(id: string, enabled: boolean): Promise<ProductService> {
  try {
    console.log(`Toggling service ${id} activation to ${enabled}`);
    
    // Get organization ID from the service record
    const { data: service, error: serviceError } = await supabase
      .from('product_services')
      .select('*, product_templates!inner(organization_id)')
      .eq('id', id)
      .single();
    
    if (serviceError) {
      console.error('Error fetching service for organization ID:', serviceError);
      throw serviceError;
    }

    const organizationId = service.product_templates.organization_id;
    
    const { data: updatedService, error } = await supabase
      .from('product_services')
      .update({ enabled })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating service activation status:', error);
      throw error;
    }
    
    // Log the action
    await createAuditLog(
      organizationId, 
      enabled ? 'service_activated' : 'service_deactivated', 
      {
        service_id: id,
        service_name: updatedService.name,
        service_type: updatedService.service_type
      }
    );
    
    console.log(`Service ${enabled ? 'activated' : 'deactivated'} successfully:`, updatedService);
    return updatedService as ProductService;
    
  } catch (error) {
    console.error('Error in toggleServiceActivation:', error);
    throw error;
  }
}

export const productServiceService = {
  fetchProductServices,
  createProductService,
  updateProductService,
  deleteProductService,
  toggleServiceActivation
};
