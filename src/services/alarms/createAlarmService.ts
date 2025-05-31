
import { AlarmConfig, AlarmFormData } from '@/types/alarm';
import { alarmsApiService } from '@/services/api/alarmsApiService';
import { handleServiceError } from './baseAlarmService';

/**
 * Create a new alarm through API Gateway
 */
export async function createAlarm(organizationId: string, alarmData: AlarmFormData): Promise<AlarmConfig> {
  try {
    console.log('Creating alarm through API Gateway for organization:', organizationId);
    return await alarmsApiService.create(alarmData);
  } catch (error) {
    handleServiceError(error, 'creating alarm');
    throw error;
  }
}
