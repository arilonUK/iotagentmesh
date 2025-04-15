import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface Device {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'warning';
  organization_id: string;
  last_active_at: string;
  description?: string;
}

export const useDevices = (organizationId?: string) => {
  const {
    data: devices = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['devices', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      
      try {
        const { data, error } = await supabase
          .from('devices')
          .select('*')
          .eq('organization_id', organizationId);
        
        if (error) {
          console.error('Error fetching devices:', error);
          throw error;
        }
        
        return data as unknown as Device[];
      } catch (err) {
        console.error('Failed to fetch devices:', err);
        return [];
      }
    },
    enabled: !!organizationId,
  });
  
  return {
    devices,
    isLoading,
    error,
    refetch
  };
};

export const useDevice = (deviceId?: string) => {
  const {
    data: device,
    isLoading,
    error
  } = useQuery({
    queryKey: ['device', deviceId],
    queryFn: async () => {
      if (!deviceId) return null;
      
      try {
        const { data, error } = await supabase
          .from('devices')
          .select('*')
          .eq('id', deviceId)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching device:', error);
          
          if (process.env.NODE_ENV === 'development') {
            console.log('Returning mock data for deviceId:', deviceId);
            if (deviceId === '44444444-4444-4444-4444-444444444444') {
              return {
                id: '44444444-4444-4444-4444-444444444444',
                name: 'Air Quality Monitor',
                type: 'Sensor',
                status: 'warning' as const,
                organization_id: '7dcfb1a6-d855-4ed7-9a45-2e9f54590c18',
                last_active_at: new Date().toISOString()
              } as Device;
            }
            
            if (deviceId === '11111111-1111-1111-1111-111111111111') {
              return {
                id: '11111111-1111-1111-1111-111111111111',
                name: 'Temperature Sensor',
                type: 'Sensor',
                status: 'online' as const,
                organization_id: '7dcfb1a6-d855-4ed7-9a45-2e9f54590c18',
                last_active_at: new Date().toISOString()
              } as Device;
            } else if (deviceId === '22222222-2222-2222-2222-222222222222') {
              return {
                id: '22222222-2222-2222-2222-222222222222',
                name: 'Smart Light',
                type: 'Actuator',
                status: 'online' as const,
                organization_id: '7dcfb1a6-d855-4ed7-9a45-2e9f54590c18',
                last_active_at: new Date().toISOString()
              } as Device;
            } else if (deviceId === '33333333-3333-3333-3333-333333333333') {
              return {
                id: '33333333-3333-3333-3333-333333333333',
                name: 'Motion Detector',
                type: 'Sensor',
                status: 'offline' as const,
                organization_id: '7dcfb1a6-d855-4ed7-9a45-2e9f54590c18',
                last_active_at: new Date(Date.now() - 86400000).toISOString()
              } as Device;
            }
          }
          
          toast({
            title: "Error loading device",
            description: `Database error: ${error.message}`,
            variant: "destructive",
          });
          
          throw new Error(`Failed to fetch device: ${error.message}`);
        }
        
        return data as Device;
      } catch (err) {
        console.error('Error in device fetch:', err);
        throw new Error(err instanceof Error ? err.message : 'Failed to fetch device');
      }
    },
    enabled: !!deviceId,
    retry: 1,
    staleTime: 1000 * 60 * 5
  });
  
  return {
    device,
    isLoading,
    error: error ? (error as Error).message : null
  };
};

export const verifyMockData = async (organizationId: string) => {
  try {
    console.group('Mock Data Verification');
    console.log('Starting verification for organization:', organizationId);
    
    // Verify devices
    console.group('Verifying Devices');
    const { data: devices, error: deviceError } = await supabase
      .from('devices')
      .select('*')
      .eq('organization_id', organizationId);

    if (deviceError) {
      console.error('Error fetching devices:', deviceError);
      throw deviceError;
    }

    console.log(`Found ${devices?.length || 0} devices`);
    devices?.forEach(device => {
      console.log(`- Device: ${device.name} (${device.id})`);
      console.log(`  Type: ${device.type}`);
      console.log(`  Status: ${device.status}`);
      console.log(`  Last Active: ${device.last_active_at}`);
    });
    console.groupEnd();

    // Verify device readings
    console.group('Verifying Device Readings');
    const { data: readings, error: readingsError } = await supabase
      .from('device_readings')
      .select('*')
      .eq('organization_id', organizationId);

    if (readingsError) {
      console.error('Error fetching device readings:', readingsError);
      throw readingsError;
    }

    console.log(`Found ${readings?.length || 0} device readings`);
    const readingsByDevice = readings?.reduce((acc, reading) => {
      acc[reading.device_id] = (acc[reading.device_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(readingsByDevice || {}).forEach(([deviceId, count]) => {
      const device = devices?.find(d => d.id === deviceId);
      console.log(`- Device "${device?.name}" (${deviceId}): ${count} readings`);
    });
    console.groupEnd();

    console.log('Verification completed successfully');
    console.groupEnd();

    return {
      devices,
      readings
    };
  } catch (err) {
    console.error('Error verifying mock data:', err);
    console.groupEnd();
    throw err;
  }
};

export const useVerifyMockData = (organizationId?: string) => {
  return useQuery({
    queryKey: ['mock-data-verification', organizationId],
    queryFn: () => verifyMockData(organizationId!),
    enabled: !!organizationId
  });
};
