
import { supabase } from '@/integrations/supabase/client';
import { EndpointConfig } from '@/types/endpoint';
import { SupabaseEndpoint, handleServiceError } from './baseEndpointService';

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
        error: unknown; 
      };
    
    if (error) {
      handleServiceError(error, 'fetching endpoints');
      return [];
    }
    
    return (data || []).map(endpoint => ({
      id: endpoint.id,
      name: endpoint.name,
      description: endpoint.description || undefined,
      type: endpoint.type as EndpointConfig['type'],
      organization_id: endpoint.organization_id,
      enabled: endpoint.enabled,
      configuration: endpoint.configuration as unknown as EndpointConfig['configuration'],
      created_at: endpoint.created_at,
      updated_at: endpoint.updated_at
    }));
  } catch (error) {
    handleServiceError(error, 'fetchEndpoints');
    return [];
  }
}
