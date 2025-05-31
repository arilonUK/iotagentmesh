
import { alarmApiService } from '@/services/alarmApiService';
import { handleServiceError } from './baseAlarmService';
import { toast } from 'sonner';

/**
 * Test an alarm through API Gateway
 */
export async function testAlarm(alarmId: string): Promise<boolean> {
  try {
    console.log('Testing alarm through API Gateway:', alarmId);
    const result = await alarmApiService.testAlarm(alarmId);
    if (result.success) {
      toast.success(result.message || 'Alarm test completed successfully');
      return true;
    } else {
      toast.error('Alarm test failed');
      return false;
    }
  } catch (error) {
    handleServiceError(error, 'testing alarm');
    return false;
  }
}
