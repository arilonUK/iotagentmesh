
import { supabase } from '@/integrations/supabase/client';
import { AlarmConfig } from '@/types/alarm';
import { SupabaseAlarm, handleServiceError } from './baseAlarmService';

/**
 * Fetch all alarms for an organization
 */
export async function fetchAlarms(organizationId: string): Promise<AlarmConfig[]> {
  try {
    // Using generic query to avoid TypeScript issues
    const { data, error } = await supabase
      .from('alarms')
      .select(`
        *,
        devices(id, name, type),
        alarm_endpoints(endpoint_id)
      `)
      .eq('organization_id', organizationId) as { 
        data: (SupabaseAlarm & { 
          devices: { id: string; name: string; type: string } | null;
          alarm_endpoints: { endpoint_id: string }[] | null;
        })[] | null; 
        error: any; 
      };
    
    if (error) {
      handleServiceError(error, 'fetching alarms');
      return [];
    }
    
    return (data || []).map(alarm => ({
      id: alarm.id,
      name: alarm.name,
      description: alarm.description || undefined,
      organization_id: alarm.organization_id,
      device_id: alarm.device_id,
      device: alarm.devices ? {
        id: alarm.devices.id,
        name: alarm.devices.name,
        type: alarm.devices.type
      } : undefined,
      enabled: alarm.enabled,
      reading_type: alarm.reading_type,
      condition_operator: alarm.condition_operator as any,
      condition_value: alarm.condition_value,
      severity: alarm.severity as any,
      cooldown_minutes: alarm.cooldown_minutes,
      created_at: alarm.created_at,
      updated_at: alarm.updated_at,
      endpoints: alarm.alarm_endpoints?.map(ae => ae.endpoint_id) || []
    }));
  } catch (error) {
    handleServiceError(error, 'fetchAlarms');
    return [];
  }
}
