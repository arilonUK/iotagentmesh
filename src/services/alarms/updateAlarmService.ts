
import { AlarmConfig, AlarmFormData } from '@/types/alarm';
import { alarmsApiService } from '@/services/api/alarmsApiService';
import { handleServiceError } from './baseAlarmService';

/**
 * Update an alarm through API Gateway
 */
export async function updateAlarm(alarmId: string, alarmData: Partial<AlarmFormData>): Promise<AlarmConfig> {
  try {
    console.log('Updating alarm through API Gateway:', alarmId);
    return await alarmsApiService.update(alarmId, alarmData);
  } catch (error) {
    handleServiceError(error, 'updating alarm');
    throw error;
  }
}
