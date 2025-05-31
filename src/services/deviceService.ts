
import { Device } from '@/types/device';
import { deviceApiService, CreateDeviceRequest, UpdateDeviceRequest } from '@/services/deviceApiService';

/**
 * Validates and formats a device ID to ensure it's in the correct format
 */
const validateDeviceId = (deviceId: string): string | null => {
  console.log('Validating device ID:', deviceId, 'Type:', typeof deviceId);

  if (!deviceId) {
    console.warn('Empty device ID provided to validator');
    return null;
  }

  let formattedId = deviceId.trim();
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isValidUuid = uuidRegex.test(formattedId);
  
  if (!isValidUuid) {
    console.warn(`Device ID ${formattedId} is not in valid UUID format`);
    return null;
  }
  
  console.log(`Device ID ${formattedId} is in valid UUID format`);
  return formattedId;
};

export const fetchDevices = async (organizationId: string): Promise<Device[]> => {
  try {
    console.log(`Starting fetchDevices with organization ID: ${organizationId}`);
    
    if (!organizationId) {
      console.error('fetchDevices called with empty organization ID');
      return [];
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(organizationId)) {
      console.error('fetchDevices called with invalid UUID format:', organizationId);
      return [];
    }
    
    const devices = await deviceApiService.fetchDevices();
    console.log(`Successfully fetched ${devices.length} devices for organization: ${organizationId}`);
    
    return devices;
  } catch (error) {
    console.error('Unexpected error in fetchDevices:', error);
    return [];
  }
};

export const fetchDevice = async (deviceId: string): Promise<Device | null> => {
  try {
    const validDeviceId = validateDeviceId(deviceId);
    console.log('Fetching device with validated ID:', validDeviceId);
    
    if (!validDeviceId) {
      console.error('Invalid device ID provided:', deviceId);
      return null;
    }

    const device = await deviceApiService.fetchDevice(validDeviceId);
    
    if (!device) {
      console.log('Device not found for ID:', validDeviceId);
      return null;
    }
    
    console.log('Device fetched successfully:', device);
    return device;
  } catch (error) {
    console.error('Error fetching device details:', error);
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
    
    const newDevice = await deviceApiService.createDevice(createRequest);
    console.log('Device created successfully:', newDevice);
    
    return newDevice;
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
    
    const updatedDevice = await deviceApiService.updateDevice(id, updateRequest);
    console.log('Device updated successfully:', updatedDevice);
    
    return updatedDevice;
  } catch (error) {
    console.error('Error updating device:', error);
    return null;
  }
};

export const deleteDevice = async (id: string): Promise<boolean> => {
  try {
    console.log(`Deleting device with ID: ${id}`);
    
    const success = await deviceApiService.deleteDevice(id);
    console.log('Device deleted successfully');
    
    return success;
  } catch (error) {
    console.error('Error deleting device:', error);
    return false;
  }
};
