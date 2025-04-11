
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SupabaseEndpoint {
  id: string;
  name: string;
  description: string | null;
  type: string;
  organization_id: string;
  enabled: boolean;
  configuration: any;
  created_at: string;
  updated_at: string;
}

export const handleServiceError = (error: any, operation: string): void => {
  console.error(`Error in ${operation}:`, error);
  toast.error(`Failed to ${operation}`);
};
