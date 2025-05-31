
import { AlarmConfig } from '@/types/alarm';
import { alarmApiService } from '@/services/alarmApiService';
import { handleServiceError } from './baseAlarmService';

/**
 * Fetch alarms for the organization through API Gateway
 */
export async function fetchAlarms(organizationId: string): Promise<AlarmConfig[]> {
  try {
    console.log('Fetching alarms through API Gateway for organization:', organizationId);
    return await alarmApiService.getAlarms();
  } catch (error) {
    handleServiceError(error, 'fetching alarms');
    return [];
  }
}
