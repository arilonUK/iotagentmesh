
// Re-export the new standardized device API service
export { devicesApiService as deviceApiService, CreateDeviceRequest, UpdateDeviceRequest } from '@/services/api/devicesApiService';

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

  async createDevice(deviceData: any) {
    const { devicesApiService } = await import('@/services/api/devicesApiService');
    return devicesApiService.create(deviceData);
  }

  async updateDevice(deviceId: string, deviceData: any) {
    const { devicesApiService } = await import('@/services/api/devicesApiService');
    return devicesApiService.update(deviceId, deviceData);
  }

  async deleteDevice(deviceId: string) {
    const { devicesApiService } = await import('@/services/api/devicesApiService');
    return devicesApiService.delete(deviceId);
  }
};

export const deviceApiService = new DeviceApiService();
