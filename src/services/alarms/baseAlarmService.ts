
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AlarmConditionValue {
  [key: string]: unknown;
}

export interface SupabaseAlarm {
  id: string;
  name: string;
  description: string | null;
  organization_id: string;
  device_id: string | null;
  enabled: boolean;
  reading_type: string;
  condition_operator: string;
  condition_value: AlarmConditionValue;
  severity: string;
  cooldown_minutes: number;
  created_at: string;
  updated_at: string;
  
  // Additional fields returned from the RPC function
  device_name?: string;
  device_type?: string;
  endpoints?: string[];
}

/**
 * Validates if a string is a valid UUID
 * @param id The string to validate as UUID
 * @returns boolean indicating if the string is a valid UUID format
 */
export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const handleServiceError = (error: unknown, operation: string): void => {
  console.error(`Error in ${operation}:`, error);
  toast.error(`Failed to ${operation}`);
};
