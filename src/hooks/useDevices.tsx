
import { useQuery } from '@tanstack/react-query';
import { fetchDevices, fetchDevice } from '@/services/deviceService';
import { toast } from '@/components/ui/use-toast';

export const useDevices = (organizationId?: string) => {
  console.log('useDevices hook called with organization ID:', organizationId);
  
  const {
    data: devices = [],
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['devices', organizationId],
    queryFn: async () => {
      if (!organizationId) {
        console.log('No organization ID provided, skipping fetch');
        return [];
      }
      
      console.log('Fetching devices for organization:', organizationId);
      try {
        const result = await fetchDevices(organizationId);
        console.log(`Found ${result.length} devices for organization ${organizationId}:`, result);
        return result;
      } catch (err) {
        console.error('Error in useDevices query function:', err);
        throw err; // Let the error handling in useQuery take care of this
      }
    },
    enabled: !!organizationId,
    retry: 3,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000),
    staleTime: 1000 * 60, // Cache for 1 minute to reduce API calls but still be relatively fresh
  });
  
  // Enhanced error logging
  if (error) {
    console.error('Error in useDevices hook:', error);
    console.error('Error details:', {
      error,
      organizationId,
      devicesCount: devices.length
    });
  }
  
  return {
    devices,
    isLoading: isLoading || isRefetching,
    error,
    refetch
  };
};

export const useDevice = (deviceId?: string) => {
  const {
    data: device,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['device', deviceId],
    queryFn: async () => {
      if (!deviceId) {
        console.log('No device ID provided, skipping fetch');
        return null;
      }
      
      console.log('Fetching device:', deviceId);
      try {
        const result = await fetchDevice(deviceId);
        if (!result) {
          console.log('Device not found:', deviceId);
        } else {
          console.log('Device fetched successfully:', result);
        }
        return result;
      } catch (err) {
        console.error('Error fetching device:', err);
        throw err;
      }
    },
    enabled: !!deviceId,
    retry: 2,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000),
    staleTime: 1000 * 60
  });
  
  return {
    device,
    isLoading: isLoading || isRefetching,
    error: error ? (error as Error).message : null,
    refetch
  };
};
