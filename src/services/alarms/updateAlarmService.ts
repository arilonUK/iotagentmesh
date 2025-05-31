
import { AlarmConfig, AlarmFormData } from '@/types/alarm';
import { alarmApiService } from '@/services/alarmApiService';
import { handleServiceError } from './baseAlarmService';
import { toast } from 'sonner';

/**
 * Update an alarm through API Gateway
 */
export async function updateAlarm(alarmId: string, alarmData: Partial<AlarmFormData>): Promise<AlarmConfig> {
  try {
    console.log('Updating alarm through API Gateway:', alarmId);
    const alarm = await alarmApiService.updateAlarm(alarmId, alarmData);
    toast.success('Alarm updated successfully');
    return alarm;
  } catch (error) {
    handleServiceError(error, 'updating alarm');
    throw error;
  }
}
