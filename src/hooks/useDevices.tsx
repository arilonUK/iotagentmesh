import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { fetchDevices, fetchDevice } from '@/services/deviceService';
import type { Device } from '@/types/device';

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
        return await fetchDevices(organizationId);
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
        const data = await fetchDevice(deviceId);
        return data;
      } catch (err) {
        console.error('Error in device fetch:', err);
        
        toast({
          title: "Error loading device",
          description: `Database error: ${err instanceof Error ? err.message : 'Unknown error'}`,
          variant: "destructive",
        });
        
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
