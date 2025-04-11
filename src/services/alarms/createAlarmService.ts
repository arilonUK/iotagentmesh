
import { supabase } from '@/integrations/supabase/client';
import { AlarmConfig, AlarmFormData } from '@/types/alarm';
import { SupabaseAlarm, handleServiceError } from './baseAlarmService';
import { toast } from 'sonner';

/**
 * Create a new alarm
 */
export async function createAlarm(
  organizationId: string, 
  alarmData: AlarmFormData
): Promise<AlarmConfig | null> {
  try {
    // Start a transaction
    const { data, error: alarmError } = await supabase
      .from('alarms')
      .insert({
        name: alarmData.name,
        description: alarmData.description,
        organization_id: organizationId,
        device_id: alarmData.device_id,
        enabled: alarmData.enabled,
        reading_type: alarmData.reading_type,
        condition_operator: alarmData.condition_operator,
        condition_value: alarmData.condition_value,
        severity: alarmData.severity,
        cooldown_minutes: alarmData.cooldown_minutes || 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select() as {
        data: SupabaseAlarm[] | null;
        error: any;
      };

    if (alarmError || !data || data.length === 0) {
      handleServiceError(alarmError, 'creating alarm');
      return null;
    }

    const alarm = data[0];

    // If endpoints are provided, create alarm_endpoints relationships
    if (alarmData.endpoints && alarmData.endpoints.length > 0) {
      const endpointEntries = alarmData.endpoints.map(endpointId => ({
        alarm_id: alarm.id,
        endpoint_id: endpointId
      }));

      const { error: endpointsError } = await supabase
        .from('alarm_endpoints')
        .insert(endpointEntries);

      if (endpointsError) {
        console.error('Error creating alarm endpoints:', endpointsError);
        // We don't want to fail the entire operation if just the endpoints failed
      }
    }
    
    toast.success('Alarm created successfully');
    
    return {
      id: alarm.id,
      name: alarm.name,
      description: alarm.description || undefined,
      organization_id: alarm.organization_id,
      device_id: alarm.device_id,
      enabled: alarm.enabled,
      reading_type: alarm.reading_type,
      condition_operator: alarm.condition_operator as any,
      condition_value: alarm.condition_value,
      severity: alarm.severity as any,
      cooldown_minutes: alarm.cooldown_minutes,
      created_at: alarm.created_at,
      updated_at: alarm.updated_at,
      endpoints: alarmData.endpoints || []
    };
  } catch (error) {
    handleServiceError(error, 'createAlarm');
    return null;
  }
}
