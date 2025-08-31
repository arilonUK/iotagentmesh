
import { supabase } from '@/integrations/supabase/client';
import { handleServiceError } from './baseEndpointService';
import { toast } from 'sonner';

/**
 * Trigger an endpoint with data
 */
export async function triggerEndpoint(endpointId: string, data: Record<string, unknown> = {}): Promise<boolean> {
  try {
    const { error } = await supabase.functions.invoke('trigger-endpoint', {
      body: { endpointId, payload: data },
    });

    if (error) {
      handleServiceError(error, 'triggering endpoint');
      return false;
    }

    toast.success('Endpoint triggered successfully');
    return true;
  } catch (error) {
    handleServiceError(error, 'triggerEndpoint');
    return false;
  }
}
