
import { useQuery } from '@tanstack/react-query';
import { deviceApiService } from '@/services/deviceApiService';
import { useToast } from '@/hooks/use-toast';
import { Device } from '@/types/device';

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export const useDevices = (organizationId?: string) => {
  console.log('useDevices hook called with organization ID:', organizationId);
  const { toast } = useToast();
  
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
      
      if (!isValidUUID(organizationId)) {
        console.error('Invalid organization ID format:', organizationId);
        return [];
      }
      
      console.log('Fetching devices for organization:', organizationId);
      try {
        const result = await deviceApiService.fetchDevices();
        console.log(`Found ${result.length} devices for organization ${organizationId}:`, result);
        return result;
      } catch (err) {
        console.error('Error in useDevices query function:', err);
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to fetch devices",
          variant: "destructive"
        });
        throw err;
      }
    },
    enabled: !!organizationId,
    retry: 2,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000),
    staleTime: 1000 * 30,
  });
  
  if (error) {
    console.error('Error in useDevices hook:', error);
  }
  
  return {
    devices,
    isLoading: isLoading || isRefetching,
    error,
    refetch
  };
};

export const useDevice = (deviceId?: string) => {
  const { toast } = useToast();
  
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
      
      if (!isValidUUID(deviceId)) {
        console.error('Invalid device ID format:', deviceId);
        throw new Error('Invalid device ID format');
      }
      
      console.log('Fetching device:', deviceId);
      try {
        const result = await deviceApiService.fetchDevice(deviceId);
        
        if (!result) {
          console.log('Device not found:', deviceId);
          return null;
        } else {
          console.log('Device fetched successfully:', result);
          return result;
        }
      } catch (err) {
        console.error('Error fetching device:', err);
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to fetch device",
          variant: "destructive"
        });
        throw err;
      }
    },
    enabled: !!deviceId && isValidUUID(deviceId),
    retry: 1,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000),
    staleTime: 1000 * 60
  });
  
  return {
    device,
    isLoading: isLoading || isRefetching,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    refetch
  };
};
