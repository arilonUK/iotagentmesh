
import { Device } from '@/types/device';
import { devicesApiService, CreateDeviceRequest, UpdateDeviceRequest } from '@/services/api/devicesApiService';
import { QueryParams } from '@/services/base/types';

export const fetchDevices = async (organizationId?: string, params?: QueryParams): Promise<Device[]> => {
  try {
    console.log(`Starting fetchDevices with organization ID: ${organizationId}`);
    return await devicesApiService.fetchAll(params);
  } catch (error) {
    console.error('Error in fetchDevices:', error);
    return [];
  }
};

export const fetchDevice = async (deviceId: string): Promise<Device | null> => {
  try {
    console.log('Fetching device with ID:', deviceId);
    return await devicesApiService.fetchById(deviceId);
  } catch (error) {
    console.error('Error fetching device:', error);
    return null;
  }
};

export const createDevice = async (deviceData: Omit<Device, 'id' | 'last_active_at'>): Promise<Device | null> => {
  try {
    console.log('Creating new device with data:', deviceData);
    
    const createRequest: CreateDeviceRequest = {
      name: deviceData.name,
      type: deviceData.type,
      status: deviceData.status,
      description: deviceData.description
    };
    
    return await devicesApiService.create(createRequest);
  } catch (error) {
    console.error('Error creating device:', error);
    return null;
  }
};

export const updateDevice = async (id: string, deviceData: Partial<Device>): Promise<Device | null> => {
  try {
    console.log(`Updating device ${id} with data:`, deviceData);
    
    const updateRequest: UpdateDeviceRequest = {
      name: deviceData.name,
      type: deviceData.type,
      status: deviceData.status,
      description: deviceData.description
    };
    
    return await devicesApiService.update(id, updateRequest);
  } catch (error) {
    console.error('Error updating device:', error);
    return null;
  }
};

export const deleteDevice = async (id: string): Promise<boolean> => {
  try {
    console.log(`Deleting device with ID: ${id}`);
    return await devicesApiService.delete(id);
  } catch (error) {
    console.error('Error deleting device:', error);
    return false;
  }
};
