
import { supabase } from '@/integrations/supabase/client';
import { Device } from '@/types/device';
import { getMockDevice } from '@/mocks/deviceMocks';

export const fetchDevices = async (organizationId: string): Promise<Device[]> => {
  const { data, error } = await supabase
    .from('devices')
    .select('*')
    .eq('organization_id', organizationId);
    
  if (error) {
    console.error('Error fetching devices:', error);
    throw error;
  }
    
  return data as Device[];
};

export const fetchDevice = async (deviceId: string): Promise<Device | null> => {
  const { data, error } = await supabase
    .from('devices')
    .select('*')
    .eq('id', deviceId)
    .maybeSingle();
    
  if (error) {
    console.error('Error fetching device:', error);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Returning mock data for deviceId:', deviceId);
      return getMockDevice(deviceId);
    }
    
    throw error;
  }
    
  return data as Device;
};
