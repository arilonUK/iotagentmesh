
import { alarmsApiService } from '@/services/api/alarmsApiService';
import { handleServiceError } from './baseAlarmService';

/**
 * Delete an alarm through API Gateway
 */
export async function deleteAlarm(alarmId: string): Promise<boolean> {
  try {
    console.log('Deleting alarm through API Gateway:', alarmId);
    return await alarmsApiService.delete(alarmId);
  } catch (error) {
    handleServiceError(error, 'deleting alarm');
    return false;
  }
}
