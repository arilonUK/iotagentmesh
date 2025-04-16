
import { supabase } from '@/integrations/supabase/client';
import { AlarmConfig } from '@/types/alarm';
import { SupabaseAlarm, handleServiceError } from './baseAlarmService';

/**
 * Fetch all alarms for an organization
 */
export async function fetchAlarms(organizationId: string): Promise<AlarmConfig[]> {
  try {
    console.log(`Fetching alarms for organization: ${organizationId}`);

    // Use a regular query instead of RPC since the RPC function isn't created yet
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
      console.error('Error in fetchAlarms query:', error);
      handleServiceError(error, 'fetching alarms');
      return [];
    }
    
    if (!data || !Array.isArray(data)) {
      console.warn('No alarms data returned or invalid format:', data);
      return [];
    }
    
    console.log(`Successfully fetched ${data.length} alarms`);
    
    // Transform the data to match the AlarmConfig interface
    const alarms = data.map(alarm => {
      // Extract device data if available
      const device = alarm.devices ? {
        id: alarm.devices.id,
        name: alarm.devices.name,
        type: alarm.devices.type
      } : undefined;
      
      // Extract endpoints if available
      const endpoints = alarm.alarm_endpoints?.map(ae => ae.endpoint_id) || [];
      
      return {
        id: alarm.id,
        name: alarm.name,
        description: alarm.description || undefined,
        organization_id: alarm.organization_id,
        device_id: alarm.device_id,
        device: device,
        enabled: alarm.enabled,
        reading_type: alarm.reading_type,
        condition_operator: alarm.condition_operator as any,
        condition_value: alarm.condition_value,
        severity: alarm.severity as any,
        cooldown_minutes: alarm.cooldown_minutes,
        created_at: alarm.created_at,
        updated_at: alarm.updated_at,
        endpoints: endpoints
      };
    });
    
    return alarms;
  } catch (error) {
    console.error('Unexpected error in fetchAlarms:', error);
    handleServiceError(error, 'fetchAlarms');
    return [];
  }
}
