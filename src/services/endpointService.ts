
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
    // Using generic query to avoid TypeScript issues
    const { data, error } = await supabase
      .from('endpoints')
      .select('*')
      .eq('organization_id', organizationId) as { 
        data: SupabaseEndpoint[] | null; 
        error: any; 
      };
    
    if (error) {
      console.error('Error fetching endpoints:', error);
      return [];
    }
    
    return (data || []).map(endpoint => ({
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
    // Using generic query to avoid TypeScript issues
    const { error, data } = await supabase
      .from('endpoints')
      .insert({
        name: endpointData.name,
        description: endpointData.description,
        type: endpointData.type,
        organization_id: organizationId,
        enabled: endpointData.enabled,
        configuration: endpointData.configuration,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select() as {
        data: SupabaseEndpoint[] | null;
        error: any;
      };

    if (error) {
      console.error('Error creating endpoint:', error);
      toast.error('Failed to create endpoint');
      return null;
    }

    if (!data || data.length === 0) {
      toast.error('No endpoint data returned after creation');
      return null;
    }

    const endpoint = data[0];
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
    // Create an update object with only the fields that are provided
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (endpointData.name !== undefined) updateData.name = endpointData.name;
    if (endpointData.description !== undefined) updateData.description = endpointData.description;
    if (endpointData.type !== undefined) updateData.type = endpointData.type;
    if (endpointData.enabled !== undefined) updateData.enabled = endpointData.enabled;
    if (endpointData.configuration !== undefined) updateData.configuration = endpointData.configuration;
    
    // Using generic query to avoid TypeScript issues
    const { error } = await supabase
      .from('endpoints')
      .update(updateData)
      .eq('id', endpointId) as { error: any };

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
    // Using generic query to avoid TypeScript issues
    const { error } = await supabase
      .from('endpoints')
      .delete()
      .eq('id', endpointId) as { error: any };

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
