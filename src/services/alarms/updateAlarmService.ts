
import { supabase } from '@/integrations/supabase/client';
import { AlarmFormData } from '@/types/alarm';
import { handleServiceError } from './baseAlarmService';
import { toast } from 'sonner';

/**
 * Update an existing alarm
 */
export async function updateAlarm(
  alarmId: string,
  alarmData: Partial<AlarmFormData>
): Promise<boolean> {
  try {
    // Create an update object with only the fields that are provided
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (alarmData.name !== undefined) updateData.name = alarmData.name;
    if (alarmData.description !== undefined) updateData.description = alarmData.description;
    if (alarmData.device_id !== undefined) updateData.device_id = alarmData.device_id;
    if (alarmData.enabled !== undefined) updateData.enabled = alarmData.enabled;
    if (alarmData.reading_type !== undefined) updateData.reading_type = alarmData.reading_type;
    if (alarmData.condition_operator !== undefined) updateData.condition_operator = alarmData.condition_operator;
    if (alarmData.condition_value !== undefined) updateData.condition_value = alarmData.condition_value;
    if (alarmData.severity !== undefined) updateData.severity = alarmData.severity;
    if (alarmData.cooldown_minutes !== undefined) updateData.cooldown_minutes = alarmData.cooldown_minutes;
    
    // Update the alarm
    const { error } = await supabase
      .from('alarms')
      .update(updateData)
      .eq('id', alarmId);

    if (error) {
      handleServiceError(error, 'updating alarm');
      return false;
    }

    // If endpoints are provided, update the alarm_endpoints relationships
    if (alarmData.endpoints !== undefined) {
      // First delete existing relationships
      await supabase
        .from('alarm_endpoints')
        .delete()
        .eq('alarm_id', alarmId);

      // Then insert new relationships
      if (alarmData.endpoints.length > 0) {
        const endpointEntries = alarmData.endpoints.map(endpointId => ({
          alarm_id: alarmId,
          endpoint_id: endpointId
        }));

        const { error: endpointsError } = await supabase
          .from('alarm_endpoints')
          .insert(endpointEntries);

        if (endpointsError) {
          console.error('Error updating alarm endpoints:', endpointsError);
          // We don't want to fail the entire operation if just the endpoints failed
        }
      }
    }

    toast.success('Alarm updated successfully');
    return true;
  } catch (error) {
    handleServiceError(error, 'updateAlarm');
    return false;
  }
}
