
import { supabase } from '@/integrations/supabase/client';
import { EndpointFormData } from '@/types/endpoint';
import { handleServiceError } from './baseEndpointService';
import { toast } from 'sonner';

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
      handleServiceError(error, 'updating endpoint');
      return false;
    }

    toast.success('Endpoint updated successfully');
    return true;
  } catch (error) {
    handleServiceError(error, 'updateEndpoint');
    return false;
  }
}
