
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
    console.log('Updating endpoint:', endpointId, 'with data:', JSON.stringify(endpointData));
    
    if (!endpointId) {
      console.error('Error updating endpoint: No endpoint ID provided');
      toast.error('Failed to update endpoint: No endpoint ID provided');
      return false;
    }
    
    // Create an update object with only the fields that are provided
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };
    
    // Only add properties that are defined
    if (endpointData.name !== undefined) updateData['name'] = endpointData.name;
    if (endpointData.description !== undefined) updateData['description'] = endpointData.description;
    if (endpointData.type !== undefined) updateData['type'] = endpointData.type;
    if (endpointData.enabled !== undefined) updateData['enabled'] = endpointData.enabled;
    if (endpointData.configuration !== undefined) updateData['configuration'] = endpointData.configuration;
    
    // Using generic query to avoid TypeScript issues
    const { error, data } = await supabase
      .from('endpoints')
      .update(updateData)
      .eq('id', endpointId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating endpoint:', error);
      handleServiceError(error, 'updating endpoint');
      return false;
    }

    if (!data) {
      console.error('No endpoint data returned after update');
      toast.error('Failed to update endpoint: No data returned from database');
      return false;
    }

    console.log('Endpoint updated successfully:', data);
    toast.success('Endpoint updated successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error in updateEndpoint:', error);
    handleServiceError(error, 'updateEndpoint');
    return false;
  }
}
