
import { AlarmConfig } from '@/types/alarm';
import { alarmsApiService } from '@/services/api/alarmsApiService';
import { handleServiceError } from './baseAlarmService';

/**
 * Fetch alarms for the organization through API Gateway
 */
export async function fetchAlarms(organizationId: string): Promise<AlarmConfig[]> {
  try {
    console.log('Fetching alarms through API Gateway for organization:', organizationId);
    return await alarmsApiService.fetchAll();
  } catch (error) {
    handleServiceError(error, 'fetching alarms');
    return [];
  }
}
