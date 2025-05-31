
import { apiGatewayService, ApiGatewayRequest, ApiGatewayResponse } from '@/services/apiGatewayService';
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

export interface DeviceApiResponse {
  devices?: Device[];
  device?: Device;
  message?: string;
}

export class DeviceApiService {
  /**
   * Fetch all devices for the current organization
   */
  async fetchDevices(): Promise<Device[]> {
    try {
      const request: ApiGatewayRequest = {
        method: 'GET',
        endpoint: '/api/devices'
      };

      const response: ApiGatewayResponse<DeviceApiResponse> = await apiGatewayService.request(request);
      
      if (response.error) {
        console.error('Failed to fetch devices:', response.error);
        throw new Error(response.error);
      }

      return response.data?.devices || [];
    } catch (error) {
      console.error('Error fetching devices:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch devices');
    }
  }

  /**
   * Fetch a specific device by ID
   */
  async fetchDevice(deviceId: string): Promise<Device | null> {
    try {
      const request: ApiGatewayRequest = {
        method: 'GET',
        endpoint: `/api/devices/${deviceId}`
      };

      const response: ApiGatewayResponse<DeviceApiResponse> = await apiGatewayService.request(request);
      
      if (response.error) {
        if (response.status === 404) {
          return null;
        }
        console.error('Failed to fetch device:', response.error);
        throw new Error(response.error);
      }

      return response.data?.device || null;
    } catch (error) {
      console.error('Error fetching device:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch device');
    }
  }

  /**
   * Create a new device
   */
  async createDevice(deviceData: CreateDeviceRequest): Promise<Device> {
    try {
      const request: ApiGatewayRequest = {
        method: 'POST',
        endpoint: '/api/devices',
        data: deviceData,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const response: ApiGatewayResponse<DeviceApiResponse> = await apiGatewayService.request(request);
      
      if (response.error) {
        console.error('Failed to create device:', response.error);
        throw new Error(response.error);
      }

      if (!response.data?.device) {
        throw new Error('No device data returned from creation');
      }

      return response.data.device;
    } catch (error) {
      console.error('Error creating device:', error);
      throw error instanceof Error ? error : new Error('Failed to create device');
    }
  }

  /**
   * Update an existing device
   */
  async updateDevice(deviceId: string, deviceData: UpdateDeviceRequest): Promise<Device> {
    try {
      const request: ApiGatewayRequest = {
        method: 'PUT',
        endpoint: `/api/devices/${deviceId}`,
        data: deviceData,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const response: ApiGatewayResponse<DeviceApiResponse> = await apiGatewayService.request(request);
      
      if (response.error) {
        console.error('Failed to update device:', response.error);
        throw new Error(response.error);
      }

      if (!response.data?.device) {
        throw new Error('No device data returned from update');
      }

      return response.data.device;
    } catch (error) {
      console.error('Error updating device:', error);
      throw error instanceof Error ? error : new Error('Failed to update device');
    }
  }

  /**
   * Delete a device
   */
  async deleteDevice(deviceId: string): Promise<boolean> {
    try {
      const request: ApiGatewayRequest = {
        method: 'DELETE',
        endpoint: `/api/devices/${deviceId}`
      };

      const response: ApiGatewayResponse = await apiGatewayService.request(request);
      
      if (response.error) {
        console.error('Failed to delete device:', response.error);
        throw new Error(response.error);
      }

      return response.status === 200;
    } catch (error) {
      console.error('Error deleting device:', error);
      throw error instanceof Error ? error : new Error('Failed to delete device');
    }
  }
}

export const deviceApiService = new DeviceApiService();
