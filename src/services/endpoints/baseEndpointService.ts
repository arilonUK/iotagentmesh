
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SupabaseEndpoint {
  id: string;
  name: string;
  description: string | null;
  type: string;
  organization_id: string;
  enabled: boolean;
  configuration: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const handleServiceError = (error: unknown, operation: string): void => {
  console.error(`Error in ${operation}:`, error);
  toast.error(`Failed to ${operation}`);
};
