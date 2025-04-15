
import { useQuery } from '@tanstack/react-query';
import { fetchDevices, fetchDevice } from '@/services/deviceService';
import { toast } from '@/components/ui/use-toast';

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
      
      console.log('Fetching devices for organization:', organizationId);
      try {
        const result = await fetchDevices(organizationId);
        console.log(`Found ${result.length} devices`);
        return result;
      } catch (err) {
        console.error('Error in useDevices query function:', err);
        return []; // Return empty array to prevent UI errors
      }
    },
    enabled: !!organizationId,
    retry: 1, // Only retry once to avoid hammering the server
    staleTime: 1000 * 60, // Cache for 1 minute
  });
  
  // Show toast only for actual error responses, not for empty results
  if (error && !isLoading) {
    console.error('Error in useDevices hook:', error);
    toast({
      title: "Failed to load devices",
      description: "There was an error loading your devices. Please try again later.",
      variant: "destructive",
    });
  }
  
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
    error,
    refetch
  } = useQuery({
    queryKey: ['device', deviceId],
    queryFn: async () => {
      if (!deviceId) return null;
      return await fetchDevice(deviceId);
    },
    enabled: !!deviceId,
    retry: 1,
    staleTime: 1000 * 60 * 5
  });
  
  return {
    device,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch
  };
};
