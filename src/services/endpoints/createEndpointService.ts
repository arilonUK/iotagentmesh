
import { supabase } from '@/integrations/supabase/client';
import { EndpointConfig, EndpointFormData } from '@/types/endpoint';
import { SupabaseEndpoint, handleServiceError } from './baseEndpointService';
import { toast } from 'sonner';

/**
 * Create a new endpoint
 */
export async function createEndpoint(
  organizationId: string, 
  endpointData: EndpointFormData
): Promise<EndpointConfig | null> {
  try {
    console.log('Creating endpoint with data:', JSON.stringify(endpointData));
    
    if (!organizationId) {
      console.error('Error creating endpoint: No organization ID provided');
      toast.error('Failed to create endpoint: No organization ID provided');
      return null;
    }
    
    // Using generic query to avoid TypeScript issues
    const { error, data } = await supabase
      .from('endpoints')
      .insert({
        name: endpointData.name,
        description: endpointData.description || null,
        type: endpointData.type,
        organization_id: organizationId,
        enabled: endpointData.enabled,
        configuration: endpointData.configuration || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating endpoint:', error);
      handleServiceError(error, 'creating endpoint');
      return null;
    }

    if (!data) {
      console.error('No endpoint data returned after creation');
      toast.error('Failed to create endpoint: No data returned from database');
      return null;
    }

    console.log('Created endpoint successfully:', data);
    toast.success('Endpoint created successfully');
    
    // First convert to unknown, then to the expected type to satisfy TypeScript
    // This is safe because we know the shape of the configuration matches our endpoint types
    const typedConfiguration = (data.configuration as unknown) as EndpointConfig['configuration'];
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      type: data.type as EndpointConfig['type'],
      organization_id: data.organization_id,
      enabled: data.enabled,
      configuration: typedConfiguration,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Unexpected error in createEndpoint:', error);
    handleServiceError(error, 'createEndpoint');
    return null;
  }
}
