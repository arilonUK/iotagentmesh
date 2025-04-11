
import { supabase } from '@/integrations/supabase/client';
import { handleServiceError } from './baseEndpointService';
import { toast } from 'sonner';

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
      handleServiceError(error, 'deleting endpoint');
      return false;
    }

    toast.success('Endpoint deleted successfully');
    return true;
  } catch (error) {
    handleServiceError(error, 'deleteEndpoint');
    return false;
  }
}
