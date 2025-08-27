
// Re-export the new standardized alarm API service
export { alarmsApiService as alarmApiService } from '@/services/api/alarmsApiService';

// Import types for backward compatibility
import type { AlarmFormData, AlarmConfig, AlarmEvent } from '@/types/alarm';

// Backward compatibility
export const AlarmApiService = class {
  async getAlarms() {
    const { alarmsApiService } = await import('@/services/api/alarmsApiService');
    return alarmsApiService.fetchAll();
  }

  async createAlarm(formData: AlarmFormData) {
    const { alarmsApiService } = await import('@/services/api/alarmsApiService');
    return alarmsApiService.create(formData);
  }

  async updateAlarm(id: string, formData: AlarmFormData) {
    const { alarmsApiService } = await import('@/services/api/alarmsApiService');
    return alarmsApiService.update(id, formData);
  }

  async deleteAlarm(id: string) {
    const { alarmsApiService } = await import('@/services/api/alarmsApiService');
    return alarmsApiService.delete(id);
  }

  async testAlarm(id: string) {
    const { alarmsApiService } = await import('@/services/api/alarmsApiService');
    return alarmsApiService.testAlarm(id);
  }
};

// Create a separate instance to avoid conflicts
export const legacyAlarmApiService = new AlarmApiService();

// Interface exports for backward compatibility
export interface AlarmApiResponse {
  alarms?: AlarmConfig[];
  alarm?: AlarmConfig;
  success?: boolean;
  message?: string;
  event?: AlarmEvent;
}
