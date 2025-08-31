
import { supabase } from '@/integrations/supabase/client';
import { EndpointConfig } from '@/types/endpoint';
import { SupabaseEndpoint, handleServiceError } from './baseEndpointService';
import { endpointConfigurationSchema } from './endpointConfigSchema';

/**
 * Fetch all endpoints for an organization
 */
export async function fetchEndpoints(organizationId: string): Promise<EndpointConfig[]> {
  try {
    const { data, error } = await supabase
      .from('endpoints')
      .select('*')
      .eq('organization_id', organizationId)
      .returns<SupabaseEndpoint[]>();
    
    if (error) {
      handleServiceError(error, 'fetching endpoints');
      return [];
    }
    
    return (data || []).map(endpoint => {
      const configuration: EndpointConfig['configuration'] =
        endpointConfigurationSchema.parse(endpoint.configuration);

      return {
        id: endpoint.id,
        name: endpoint.name,
        description: endpoint.description || undefined,
        type: endpoint.type as EndpointConfig['type'],
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
