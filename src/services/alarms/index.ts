
import { AlarmFormData } from '@/types/alarm';

// Re-export simplified alarm service functions
export { alarmsApiService } from '../api/alarmsApiService';

// Backward compatibility functions
export const fetchAlarms = async () => {
  const { alarmsApiService } = await import('../api/alarmsApiService');
  return alarmsApiService.fetchAll();
};

export const createAlarm = async (data: AlarmFormData) => {
  const { alarmsApiService } = await import('../api/alarmsApiService');
  return alarmsApiService.create(data);
};

export const updateAlarm = async (id: string, data: Partial<AlarmFormData>) => {
  const { alarmsApiService } = await import('../api/alarmsApiService');
  return alarmsApiService.update(id, data);
};

export const deleteAlarm = async (id: string) => {
  const { alarmsApiService } = await import('../api/alarmsApiService');
  return alarmsApiService.delete(id);
};

export const testAlarm = async (id: string) => {
  const { alarmsApiService } = await import('../api/alarmsApiService');
  return alarmsApiService.testAlarm(id);
};
