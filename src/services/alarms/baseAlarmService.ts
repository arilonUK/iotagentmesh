
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SupabaseAlarm {
  id: string;
  name: string;
  description: string | null;
  organization_id: string;
  device_id: string | null;
  enabled: boolean;
  reading_type: string;
  condition_operator: string;
  condition_value: any;
  severity: string;
  cooldown_minutes: number;
  created_at: string;
  updated_at: string;
  
  // Additional fields returned from the RPC function
  device_name?: string;
  device_type?: string;
  endpoints?: string[];
}

export const handleServiceError = (error: any, operation: string): void => {
  console.error(`Error in ${operation}:`, error);
  toast.error(`Failed to ${operation}`);
};
