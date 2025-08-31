
// Re-export the new standardized device API service
export { devicesApiService as deviceApiService } from '@/services/api/devicesApiService';
export type { CreateDeviceRequest, UpdateDeviceRequest } from '@/services/api/devicesApiService';

interface DeviceData {
  name: string;
  type: string;
  agent_id?: string;
  properties?: Record<string, unknown>;
  telemetry_config?: {
    interval: number;
    metrics: string[];
  };
}

// Backward compatibility exports
export const DeviceApiService = class {
  async fetchDevices() {
    const { devicesApiService } = await import('@/services/api/devicesApiService');
    return devicesApiService.fetchAll();
  }

  async fetchDevice(deviceId: string) {
    const { devicesApiService } = await import('@/services/api/devicesApiService');
    return devicesApiService.fetchById(deviceId);
  }

  async createDevice(deviceData: DeviceData) {
    const { devicesApiService } = await import('@/services/api/devicesApiService');
    return devicesApiService.create(deviceData);
  }

  async updateDevice(deviceId: string, deviceData: Partial<DeviceData>) {
    const { devicesApiService } = await import('@/services/api/devicesApiService');
    return devicesApiService.update(deviceId, deviceData);
  }

  async deleteDevice(deviceId: string) {
    const { devicesApiService } = await import('@/services/api/devicesApiService');
    return devicesApiService.delete(deviceId);
  }
};

// Create a separate instance to avoid conflicts
export const legacyDeviceApiService = new DeviceApiService();
