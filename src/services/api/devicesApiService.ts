
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
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  // Override fetchById to handle potential null responses gracefully
  async fetchById(id: string): Promise<Device | null> {
    try {
      console.log(`Fetching device with ID: ${id}`);
      
      const response = await this.makeRequest<Device>({
        method: 'GET',
        endpoint: this.endpoint,
        pathSuffix: `/${id}`
      });

      console.log(`Device fetch response:`, response);
      return response || null;
    } catch (error) {
      if (error instanceof Error && (error.message.includes('404') || error.message.includes('not found'))) {
        console.log(`Device not found with ID: ${id}`);
        return null;
      }
      console.error(`Error fetching device:`, error);
      return null;
    }
  }

  // Override create to handle the response format
  async create(data: CreateDeviceRequest): Promise<Device> {
    try {
      console.log(`Creating device:`, data);
      
      const response = await this.makeRequest<Device>({
        method: 'POST',
        endpoint: this.endpoint,
        data
      });

      console.log(`Device created successfully:`, response);
      return response;
    } catch (error) {
      console.error(`Error creating device:`, error);
      throw error;
    }
  }

  // Override update to handle the response format
  async update(id: string, data: UpdateDeviceRequest): Promise<Device> {
    try {
      console.log(`Updating device ${id}:`, data);
      
      const response = await this.makeRequest<Device>({
        method: 'PUT',
        endpoint: this.endpoint,
        pathSuffix: `/${id}`,
        data
      });

      console.log(`Device updated successfully:`, response);
      return response;
    } catch (error) {
      console.error(`Error updating device:`, error);
      throw error;
    }
  }

  // Override delete to handle boolean response
  async delete(id: string): Promise<boolean> {
    try {
      console.log(`Deleting device ${id}`);
      
      await this.makeRequest({
        method: 'DELETE',
        endpoint: this.endpoint,
        pathSuffix: `/${id}`
      });

      console.log(`Device deleted successfully`);
      return true;
    } catch (error) {
      console.error(`Error deleting device:`, error);
      return false;
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
