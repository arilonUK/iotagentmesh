
import { apiGatewayService, ApiGatewayRequest, ApiGatewayResponse } from '@/services/apiGatewayService';
import { AlarmConfig, AlarmFormData } from '@/types/alarm';

export interface AlarmApiResponse {
  alarms?: AlarmConfig[];
  alarm?: AlarmConfig;
  success?: boolean;
  message?: string;
  event?: any;
}

export class AlarmApiService {
  /**
   * Get all alarms for the current organization
   */
  async getAlarms(): Promise<AlarmConfig[]> {
    try {
      const request: ApiGatewayRequest = {
        method: 'GET',
        endpoint: '/api/alarms'
      };

      const response: ApiGatewayResponse<AlarmApiResponse> = await apiGatewayService.request(request);
      
      if (response.error) {
        console.error('Failed to fetch alarms:', response.error);
        throw new Error(response.error);
      }

      return response.data?.alarms || [];
    } catch (error) {
      console.error('Error fetching alarms:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch alarms');
    }
  }

  /**
   * Create a new alarm
   */
  async createAlarm(formData: AlarmFormData): Promise<AlarmConfig> {
    try {
      const request: ApiGatewayRequest = {
        method: 'POST',
        endpoint: '/api/alarms',
        data: {
          name: formData.name,
          description: formData.description,
          device_id: formData.device_id,
          enabled: formData.enabled,
          reading_type: formData.reading_type,
          condition_operator: formData.condition_operator,
          condition_value: formData.condition_value,
          severity: formData.severity,
          cooldown_minutes: formData.cooldown_minutes,
          endpoints: formData.endpoints
        },
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const response: ApiGatewayResponse<AlarmApiResponse> = await apiGatewayService.request(request);
      
      if (response.error) {
        console.error('Failed to create alarm:', response.error);
        throw new Error(response.error);
      }

      if (!response.data?.alarm) {
        throw new Error('No alarm data returned from creation');
      }

      return response.data.alarm;
    } catch (error) {
      console.error('Error creating alarm:', error);
      throw error instanceof Error ? error : new Error('Failed to create alarm');
    }
  }

  /**
   * Update an existing alarm
   */
  async updateAlarm(id: string, formData: Partial<AlarmFormData>): Promise<AlarmConfig> {
    try {
      const request: ApiGatewayRequest = {
        method: 'PUT',
        endpoint: `/api/alarms/${id}`,
        data: formData,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const response: ApiGatewayResponse<AlarmApiResponse> = await apiGatewayService.request(request);
      
      if (response.error) {
        console.error('Failed to update alarm:', response.error);
        throw new Error(response.error);
      }

      if (!response.data?.alarm) {
        throw new Error('No alarm data returned from update');
      }

      return response.data.alarm;
    } catch (error) {
      console.error('Error updating alarm:', error);
      throw error instanceof Error ? error : new Error('Failed to update alarm');
    }
  }

  /**
   * Delete an alarm
   */
  async deleteAlarm(id: string): Promise<boolean> {
    try {
      const request: ApiGatewayRequest = {
        method: 'DELETE',
        endpoint: `/api/alarms/${id}`
      };

      const response: ApiGatewayResponse<AlarmApiResponse> = await apiGatewayService.request(request);
      
      if (response.error) {
        console.error('Failed to delete alarm:', response.error);
        throw new Error(response.error);
      }

      return response.data?.success || response.status === 200;
    } catch (error) {
      console.error('Error deleting alarm:', error);
      throw error instanceof Error ? error : new Error('Failed to delete alarm');
    }
  }

  /**
   * Test an alarm
   */
  async testAlarm(id: string): Promise<{ success: boolean; message: string; event?: any }> {
    try {
      const request: ApiGatewayRequest = {
        method: 'POST',
        endpoint: `/api/alarms/${id}/test`,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const response: ApiGatewayResponse<AlarmApiResponse> = await apiGatewayService.request(request);
      
      if (response.error) {
        console.error('Failed to test alarm:', response.error);
        throw new Error(response.error);
      }

      return {
        success: response.data?.success || false,
        message: response.data?.message || 'Alarm test completed',
        event: response.data?.event
      };
    } catch (error) {
      console.error('Error testing alarm:', error);
      throw error instanceof Error ? error : new Error('Failed to test alarm');
    }
  }
}

export const alarmApiService = new AlarmApiService();
