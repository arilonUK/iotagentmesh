
import { supabase } from '@/integrations/supabase/client';
import { EndpointConfig, EndpointFormData } from '@/types/endpoint';
import { toast } from 'sonner';

interface SupabaseEndpoint {
  id: string;
  name: string;
  description: string | null;
  type: string;
  organization_id: string;
  enabled: boolean;
  configuration: any;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all endpoints for an organization
 */
export async function fetchEndpoints(organizationId: string): Promise<EndpointConfig[]> {
  try {
    // Using the REST API directly instead of the typed client
    const { data, error } = await supabase
      .rpc('get_endpoints_by_org', { p_organization_id: organizationId });
    
    if (error) {
      console.error('Error fetching endpoints:', error);
      return [];
    }
    
    return (data as SupabaseEndpoint[]).map(endpoint => ({
      id: endpoint.id,
      name: endpoint.name,
      description: endpoint.description || undefined,
      type: endpoint.type as any,
      organization_id: endpoint.organization_id,
      enabled: endpoint.enabled,
      configuration: endpoint.configuration,
      created_at: endpoint.created_at,
      updated_at: endpoint.updated_at
    }));
  } catch (error) {
    console.error('Error in fetchEndpoints:', error);
    return [];
  }
}

/**
 * Create a new endpoint
 */
export async function createEndpoint(
  organizationId: string, 
  endpointData: EndpointFormData
): Promise<EndpointConfig | null> {
  try {
    // Using the REST API directly
    const { error, data } = await supabase
      .rpc('create_endpoint', { 
        p_name: endpointData.name,
        p_description: endpointData.description,
        p_type: endpointData.type,
        p_organization_id: organizationId,
        p_enabled: endpointData.enabled,
        p_configuration: endpointData.configuration
      });

    if (error) {
      console.error('Error creating endpoint:', error);
      toast.error('Failed to create endpoint');
      return null;
    }

    const endpoint = data as SupabaseEndpoint;
    toast.success('Endpoint created successfully');
    
    return {
      id: endpoint.id,
      name: endpoint.name,
      description: endpoint.description || undefined,
      type: endpoint.type as any,
      organization_id: endpoint.organization_id,
      enabled: endpoint.enabled,
      configuration: endpoint.configuration,
      created_at: endpoint.created_at,
      updated_at: endpoint.updated_at
    };
  } catch (error) {
    console.error('Error in createEndpoint:', error);
    toast.error('Failed to create endpoint');
    return null;
  }
}

/**
 * Update an existing endpoint
 */
export async function updateEndpoint(
  endpointId: string,
  endpointData: Partial<EndpointFormData>
): Promise<boolean> {
  try {
    // Using the REST API directly
    const { error } = await supabase
      .rpc('update_endpoint', { 
        p_id: endpointId,
        p_name: endpointData.name,
        p_description: endpointData.description,
        p_type: endpointData.type,
        p_enabled: endpointData.enabled !== undefined ? endpointData.enabled : null,
        p_configuration: endpointData.configuration || null
      });

    if (error) {
      console.error('Error updating endpoint:', error);
      toast.error('Failed to update endpoint');
      return false;
    }

    toast.success('Endpoint updated successfully');
    return true;
  } catch (error) {
    console.error('Error in updateEndpoint:', error);
    toast.error('Failed to update endpoint');
    return false;
  }
}

/**
 * Delete an endpoint
 */
export async function deleteEndpoint(endpointId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .rpc('delete_endpoint', { p_id: endpointId });

    if (error) {
      console.error('Error deleting endpoint:', error);
      toast.error('Failed to delete endpoint');
      return false;
    }

    toast.success('Endpoint deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteEndpoint:', error);
    toast.error('Failed to delete endpoint');
    return false;
  }
}

/**
 * Trigger an endpoint with data
 */
export async function triggerEndpoint(endpointId: string, data: any = {}): Promise<boolean> {
  try {
    const { error } = await supabase.functions.invoke('trigger-endpoint', {
      body: { endpointId, payload: data },
    });

    if (error) {
      console.error('Error triggering endpoint:', error);
      toast.error('Failed to trigger endpoint');
      return false;
    }

    toast.success('Endpoint triggered successfully');
    return true;
  } catch (error) {
    console.error('Error in triggerEndpoint:', error);
    toast.error('Failed to trigger endpoint');
    return false;
  }
}
