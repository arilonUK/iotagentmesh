
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
      .select('*')
      .single() as {
        data: SupabaseEndpoint | null;
        error: any;
      };

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
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      type: data.type as any,
      organization_id: data.organization_id,
      enabled: data.enabled,
      configuration: data.configuration,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Unexpected error in createEndpoint:', error);
    handleServiceError(error, 'createEndpoint');
    return null;
  }
}
