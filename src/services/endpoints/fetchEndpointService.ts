
import { supabase } from '@/integrations/supabase/client';
import { EndpointConfig, endpointConfigurationSchema, endpointTypeSchema } from '@/types/endpoint';
import { SupabaseEndpoint, handleServiceError } from './baseEndpointService';

/**
 * Fetch all endpoints for an organization with configuration validation
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
    
    return (data || []).map(endpoint => {
      const configuration = endpointConfigurationSchema.parse(endpoint.configuration);
      const type = endpointTypeSchema.parse(endpoint.type);

      return {
        id: endpoint.id,
        name: endpoint.name,
        description: endpoint.description || undefined,
        type,
        organization_id: endpoint.organization_id,
        enabled: endpoint.enabled,
        configuration,
        created_at: endpoint.created_at,
        updated_at: endpoint.updated_at,
      };
    });
  } catch (error) {
    handleServiceError(error, 'fetchEndpoints');
    return [];
  }
}
