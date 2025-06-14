
import { useQuery } from '@tanstack/react-query';
import { devicesApiService } from '@/services/api/devicesApiService';
import { useToast } from '@/hooks/use-toast';
import { Device } from '@/types/device';
import { useOptimizedQuery } from '@/hooks/useOptimizedQuery';

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export const useDevices = (organizationId?: string) => {
  console.log('=== USE DEVICES HOOK DEBUG ===');
  console.log('useDevices hook called with organization ID:', organizationId);
  console.log('Organization ID type:', typeof organizationId);
  console.log('Organization ID valid UUID:', organizationId ? isValidUUID(organizationId) : 'no ID provided');
  
  const { toast } = useToast();
  
  const {
    data: devices = [],
    isLoading,
    error,
    refetch,
    isRefetching
  } = useOptimizedQuery({
    queryKey: ['devices', organizationId],
    queryFn: async () => {
      console.log('=== DEVICES QUERY FUNCTION START ===');
      
      if (!organizationId) {
        console.log('No organization ID provided, returning empty array');
        return [];
      }
      
      // Accept both UUID format and default org format for now
      if (!isValidUUID(organizationId) && !organizationId.startsWith('default-org-')) {
        console.error('Invalid organization ID format:', organizationId);
        throw new Error(`Invalid organization ID format: ${organizationId}`);
      }
      
      console.log('Calling devicesApiService.fetchAll() for organization:', organizationId);
      
      try {
        const result = await devicesApiService.fetchAll();
        console.log(`✅ SUCCESS: API returned:`, result);
        console.log(`✅ SUCCESS: Result type:`, typeof result);
        console.log(`✅ SUCCESS: Result is array:`, Array.isArray(result));
        console.log(`✅ SUCCESS: Result length:`, result?.length);
        
        // Additional debugging for each device
        if (result && Array.isArray(result) && result.length > 0) {
          result.forEach((device, index) => {
            console.log(`Device ${index + 1}:`, {
              id: device.id,
              name: device.name,
              type: device.type,
              status: device.status,
              organization_id: device.organization_id
            });
          });
        } else {
          console.log('⚠️ No devices returned from API or result is not an array');
          console.log('Raw result:', result);
        }
        
        return result || [];
      } catch (err) {
        console.error('❌ ERROR in useDevices query function:', err);
        console.error('Error type:', typeof err);
        console.error('Error message:', err instanceof Error ? err.message : String(err));
        console.error('Error stack:', err instanceof Error ? err.stack : 'No stack available');
        
        // Don't show toast for network/API errors that might be temporary
        if (err instanceof Error && !err.message.includes('Function not found')) {
          toast({
            title: "Error Loading Devices",
            description: err.message || "Failed to fetch devices",
            variant: "destructive"
          });
        }
        
        // Return empty array instead of throwing to prevent UI crashes
        return [];
      }
    },
    cacheConfig: 'ORGANIZATION_DATA',
    enabled: !!organizationId,
    retry: (failureCount, error) => {
      console.log(`Query retry attempt ${failureCount}:`, error);
      // Don't retry if it's a function not found error
      if (error instanceof Error && error.message.includes('Function not found')) {
        console.log('Function not found - not retrying');
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: attempt => {
      const delay = Math.min(1000 * 2 ** attempt, 30000);
      console.log(`Retry delay: ${delay}ms`);
      return delay;
    },
  });
  
  console.log('=== USE DEVICES HOOK RESULT ===');
  console.log('Final devices array:', devices);
  console.log('Final devices length:', devices?.length);
  console.log('Final devices type:', typeof devices);
  console.log('Final devices is array:', Array.isArray(devices));
  console.log('Is loading:', isLoading || isRefetching);
  console.log('Has error:', !!error);
  console.log('Error details:', error);
  
  if (error) {
    console.error('❌ Final error in useDevices hook:', error);
  }
  
  return {
    devices,
    isLoading: isLoading || isRefetching,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
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
  } = useOptimizedQuery({
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
        const result = await devicesApiService.fetchById(deviceId);
        
        if (!result) {
          console.log('Device not found:', deviceId);
          return null;
        } else {
          console.log('Device fetched successfully:', result);
          return result;
        }
      } catch (err) {
        console.error('Error fetching device:', err);
        if (err instanceof Error && !err.message.includes('Function not found')) {
          toast({
            title: "Error",
            description: err instanceof Error ? err.message : "Failed to fetch device",
            variant: "destructive"
          });
        }
        throw err;
      }
    },
    cacheConfig: 'ORGANIZATION_DATA',
    enabled: !!deviceId && isValidUUID(deviceId),
    retry: 1,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000),
  });
  
  return {
    device,
    isLoading: isLoading || isRefetching,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    refetch
  };
};
