
import { supabase } from '@/integrations/supabase/client';
import { Device } from '@/types/device';
import { getMockDevice } from '@/mocks/deviceMocks';
import { toast } from '@/components/ui/use-toast';

export const fetchDevices = async (organizationId: string): Promise<Device[]> => {
  try {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('organization_id', organizationId);
      
    if (error) {
      console.error('Error fetching devices:', error);
      throw error;
    }
      
    return data as Device[];
  } catch (err) {
    console.error('Failed to fetch devices:', err);
    
    // In development, fall back to mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Returning mock devices for development');
      return [
        getMockDevice('device-1'),
        getMockDevice('device-2'),
        getMockDevice('device-3')
      ];
    }
    
    throw err;
  }
};

export const fetchDevice = async (deviceId: string): Promise<Device | null> => {
  try {
    // Try to fetch directly without joins, which can cause RLS policy issues
    const { data, error } = await supabase
      .from('devices')
      .select('id, name, type, status, organization_id, last_active_at')
      .eq('id', deviceId)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching device:', error);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Returning mock data for deviceId:', deviceId);
        toast({
          title: "Using mock data",
          description: "Database error encountered. Using mock device data for development.",
        });
        return getMockDevice(deviceId);
      }
      
      throw error;
    }
    
    return data as Device;
  } catch (err) {
    console.error('Device fetch failed:', err);
    
    // Fall back to mock data in development environment
    if (process.env.NODE_ENV === 'development') {
      console.log('Falling back to mock data after error');
      return getMockDevice(deviceId);
    }
    
    throw err;
  }
};
