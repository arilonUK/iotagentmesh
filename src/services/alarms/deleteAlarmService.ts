
import { alarmApiService } from '@/services/alarmApiService';
import { handleServiceError } from './baseAlarmService';
import { toast } from 'sonner';

/**
 * Delete an alarm through API Gateway
 */
export async function deleteAlarm(alarmId: string): Promise<boolean> {
  try {
    console.log('Deleting alarm through API Gateway:', alarmId);
    const success = await alarmApiService.deleteAlarm(alarmId);
    if (success) {
      toast.success('Alarm deleted successfully');
    }
    return success;
  } catch (error) {
    handleServiceError(error, 'deleting alarm');
    return false;
  }
}
