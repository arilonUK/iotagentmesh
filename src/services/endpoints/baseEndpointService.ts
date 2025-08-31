
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

export type SupabaseEndpoint = Database['public']['Tables']['endpoints']['Row'];

export const handleServiceError = (error: unknown, operation: string): void => {
  console.error(`Error in ${operation}:`, error);
  toast.error(`Failed to ${operation}`);
};
