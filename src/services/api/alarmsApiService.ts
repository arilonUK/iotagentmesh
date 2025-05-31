
import { ApiService } from '../base/ApiService';
import { AlarmConfig, AlarmFormData } from '@/types/alarm';

export class AlarmsApiService extends ApiService<AlarmConfig, AlarmFormData, Partial<AlarmFormData>> {
  protected readonly endpoint = 'api-alarms';
  protected readonly entityName = 'Alarm';
  protected readonly dataKey = 'alarms';
  protected readonly singleDataKey = 'alarm';

  async testAlarm(id: string): Promise<{ success: boolean; message: string; event?: any }> {
    try {
      console.log(`Testing alarm ${id}`);
      
      const response = await this.makeRequest<{ success: boolean; message: string; event?: any }>({
        method: 'POST',
        endpoint: `${this.endpoint}/${id}/test`
      });

      return {
        success: response.success || false,
        message: response.message || 'Alarm test completed',
        event: response.event
      };
    } catch (error) {
      console.error(`Error testing alarm ${id}:`, error);
      this.handleError(error, 'test alarm');
    }
  }
}

export const alarmsApiService = new AlarmsApiService();
