
import { StandardizedApiService } from '../../base/StandardizedApiService';
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

export class ModernizedDevicesApiService extends StandardizedApiService<Device, CreateDeviceRequest, UpdateDeviceRequest> {
  protected readonly endpoint = '/api/devices';
  protected readonly serviceName = 'DevicesApiService';

  protected getDataKey(): string {
    return 'devices';
  }

  protected getSingleDataKey(): string {
    return 'device';
  }

  protected getEntityName(): string {
    return 'Device';
  }

  // Additional device-specific methods can be added here
  async syncDevice(id: string): Promise<boolean> {
    try {
      const response = await this.makeRequest<{ success: boolean }>({
        method: 'POST',
        endpoint: `${this.endpoint}/${id}/sync`
      });

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data?.success || false;
    } catch (error) {
      this.handleError(error, 'sync device');
      return false;
    }
  }
}
