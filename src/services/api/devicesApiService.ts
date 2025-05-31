
import { BaseApiService } from '../base/BaseApiService';
import { Device } from '@/types/device';

export interface CreateDeviceRequest {
  name: string;
  type: string;
  status?: string;
  description?: string;
  product_template_id?: string;
}

export interface UpdateDeviceRequest {
  name?: string;
  type?: string;
  status?: string;
  description?: string;
  product_template_id?: string;
}

export class DevicesApiService extends BaseApiService<Device, CreateDeviceRequest, UpdateDeviceRequest> {
  protected readonly endpoint = '/api/devices';

  protected getDataKey(): string {
    return 'devices';
  }

  protected getSingleDataKey(): string {
    return 'device';
  }

  protected getEntityName(): string {
    return 'Device';
  }

  // Backward compatibility methods
  async fetchDevices(): Promise<Device[]> {
    return this.fetchAll();
  }

  async fetchDevice(deviceId: string): Promise<Device | null> {
    return this.fetchById(deviceId);
  }

  async createDevice(data: CreateDeviceRequest): Promise<Device> {
    return this.create(data);
  }

  async updateDevice(id: string, data: UpdateDeviceRequest): Promise<Device> {
    return this.update(id, data);
  }

  async deleteDevice(id: string): Promise<boolean> {
    return this.delete(id);
  }
}

export const devicesApiService = new DevicesApiService();
