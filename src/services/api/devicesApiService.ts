
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
}

export const devicesApiService = new DevicesApiService();
