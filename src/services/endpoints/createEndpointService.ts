
import { supabase } from '@/integrations/supabase/client';
import { EndpointConfig, EndpointFormData } from '@/types/endpoint';
import { SupabaseEndpoint, handleServiceError } from './baseEndpointService';

/**
 * Create a new endpoint
 */
export async function createEndpoint(
  organizationId: string, 
  endpointData: EndpointFormData
): Promise<EndpointConfig | null> {
  try {
    console.log('Creating endpoint with data:', JSON.stringify(endpointData));
    
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
      .select('*') as {
        data: SupabaseEndpoint[] | null;
        error: any;
      };

    if (error) {
      console.error('Error creating endpoint:', error);
      handleServiceError(error, 'creating endpoint');
      return null;
    }

    if (!data || data.length === 0) {
      console.error('No endpoint data returned after creation');
      return null;
    }

    const endpoint = data[0];
    console.log('Created endpoint successfully:', endpoint);
    
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
    console.error('Unexpected error in createEndpoint:', error);
    handleServiceError(error, 'createEndpoint');
    return null;
  }
}
