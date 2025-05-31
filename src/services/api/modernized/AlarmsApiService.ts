
import { StandardizedApiService } from '../../base/StandardizedApiService';
import { AlarmConfig, AlarmFormData } from '@/types/alarm';

export class ModernizedAlarmsApiService extends StandardizedApiService<AlarmConfig, AlarmFormData, Partial<AlarmFormData>> {
  protected readonly endpoint = '/api/alarms';
  protected readonly serviceName = 'AlarmsApiService';

  protected getDataKey(): string {
    return 'alarms';
  }

  protected getSingleDataKey(): string {
    return 'alarm';
  }

  protected getEntityName(): string {
    return 'Alarm';
  }

  async testAlarm(id: string): Promise<{ success: boolean; message: string; event?: any }> {
    try {
      const response = await this.makeRequest<{ success: boolean; message: string; event?: any }>({
        method: 'POST',
        endpoint: `${this.endpoint}/${id}/test`,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.error) {
        throw new Error(response.error);
      }

      return {
        success: response.data?.success || false,
        message: response.data?.message || 'Alarm test completed',
        event: response.data?.event
      };
    } catch (error) {
      this.handleError(error, 'test alarm');
      return {
        success: false,
        message: 'Failed to test alarm'
      };
    }
  }
}
