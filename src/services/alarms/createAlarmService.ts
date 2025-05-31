
import { AlarmConfig, AlarmFormData } from '@/types/alarm';
import { alarmApiService } from '@/services/alarmApiService';
import { handleServiceError } from './baseAlarmService';
import { toast } from 'sonner';

/**
 * Create a new alarm through API Gateway
 */
export async function createAlarm(organizationId: string, alarmData: AlarmFormData): Promise<AlarmConfig> {
  try {
    console.log('Creating alarm through API Gateway for organization:', organizationId);
    const alarm = await alarmApiService.createAlarm(alarmData);
    toast.success('Alarm created successfully');
    return alarm;
  } catch (error) {
    handleServiceError(error, 'creating alarm');
    throw error;
  }
}
