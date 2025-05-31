
import { BaseApiService } from '../base/BaseApiService';
import { AlarmConfig, AlarmFormData } from '@/types/alarm';

export class AlarmsApiService extends BaseApiService<AlarmConfig, AlarmFormData, Partial<AlarmFormData>> {
  protected readonly endpoint = '/api/alarms';

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
        endpoint: `/api/alarms/${id}/test`,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        success: response.success || false,
        message: response.message || 'Alarm test completed',
        event: response.event
      };
    } catch (error) {
      this.handleError(error, 'test alarm');
    }
  }
}

export const alarmsApiService = new AlarmsApiService();
