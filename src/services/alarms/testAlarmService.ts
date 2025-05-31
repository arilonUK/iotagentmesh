
import { alarmsApiService } from '@/services/api/alarmsApiService';
import { handleServiceError } from './baseAlarmService';

/**
 * Test an alarm through API Gateway
 */
export async function testAlarm(alarmId: string): Promise<boolean> {
  try {
    console.log('Testing alarm through API Gateway:', alarmId);
    const result = await alarmsApiService.testAlarm(alarmId);
    return result.success;
  } catch (error) {
    handleServiceError(error, 'testing alarm');
    return false;
  }
}
