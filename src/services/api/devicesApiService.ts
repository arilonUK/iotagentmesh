
import { ApiService } from '../base/ApiService';
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

export class DevicesApiService extends ApiService<Device, CreateDeviceRequest, UpdateDeviceRequest> {
  protected readonly endpoint = 'api-devices';
  protected readonly entityName = 'Device';
  protected readonly dataKey = 'devices';
  protected readonly singleDataKey = 'device';

  // Override fetchAll to handle the direct array response from the edge function
  async fetchAll(): Promise<Device[]> {
    try {
      console.log(`=== DEVICES API SERVICE FETCHALL START ===`);
      console.log(`Fetching all devices`);
      
      const response = await this.makeRequest<Device[]>({
        method: 'GET',
        endpoint: this.endpoint
      });

      console.log(`=== DEVICES API SERVICE FETCHALL RESPONSE ===`);
      console.log(`Raw response:`, response);
      console.log(`Response type:`, typeof response);
      console.log(`Response is array:`, Array.isArray(response));

      // The edge function now returns the devices array directly
      const devices = Array.isArray(response) ? response : [];

      console.log(`=== DEVICES API SERVICE FETCHALL FINAL ===`);
      console.log(`Final devices:`, devices);
      console.log(`Final devices length:`, devices.length);
      
      return devices;
    } catch (error) {
      console.error(`=== DEVICES API SERVICE FETCHALL ERROR ===`);
      console.error(`Error fetching devices:`, error);
      this.handleError(error, 'fetch devices');
    }
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
