
import { supabase } from '@/integrations/supabase/client';
import { AlarmConfig } from '@/types/alarm';
import { SupabaseAlarm, handleServiceError, isValidUUID } from './baseAlarmService';

/**
 * Fetch all alarms for an organization using bypass function
 */
export async function fetchAlarms(organizationId: string): Promise<AlarmConfig[]> {
  try {
    console.log(`Fetching alarms for organization: ${organizationId}`);

    // Validate organization ID format
    if (!organizationId || !isValidUUID(organizationId)) {
      console.error(`Invalid organization ID format: ${organizationId}`);
      return [];
    }

    // Use bypass function to avoid RLS recursion
    const { data, error } = await supabase
      .rpc('get_organization_alarms_bypass_rls', {
        p_org_id: organizationId
      });
    
    if (error) {
      console.error('Error in fetchAlarms RPC:', error);
      handleServiceError(error, 'fetching alarms');
      return [];
    }
    
    if (!data || !Array.isArray(data)) {
      console.warn('No alarms data returned or invalid format:', data);
      return [];
    }
    
    console.log(`Successfully fetched ${data.length} alarms`);
    
    // Transform the data to match the AlarmConfig interface
    const alarms: AlarmConfig[] = data.map((alarm: any) => ({
      id: alarm.id,
      name: alarm.name,
      description: alarm.description || undefined,
      organization_id: alarm.organization_id,
      device_id: alarm.device_id,
      device: alarm.device_name ? {
        id: alarm.device_id,
        name: alarm.device_name,
        type: alarm.device_type
      } : undefined,
      enabled: alarm.enabled,
      reading_type: alarm.reading_type,
      condition_operator: alarm.condition_operator as any,
      condition_value: alarm.condition_value,
      severity: alarm.severity as any,
      cooldown_minutes: alarm.cooldown_minutes,
      created_at: alarm.created_at,
      updated_at: alarm.updated_at,
      endpoints: alarm.endpoints || []
    }));
    
    return alarms;
  } catch (error) {
    console.error('Unexpected error in fetchAlarms:', error);
    handleServiceError(error, 'fetchAlarms');
    return [];
  }
}
