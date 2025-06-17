
import { useQuery } from '@tanstack/react-query';
import { metadataService, TimezoneInfo } from '@/services/metadata/MetadataService';

/**
 * Hook to fetch timezone information using the optimized timezone cache
 */
export const useTimezones = (timezoneName?: string) => {
  return useQuery({
    queryKey: ['timezones', timezoneName],
    queryFn: () => metadataService.getTimezones(timezoneName),
    staleTime: 5 * 60 * 1000, // 5 minutes - timezones don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Hook to fetch only timezone names using the optimized cache
 */
export const useTimezoneNames = () => {
  return useQuery({
    queryKey: ['timezone-names'],
    queryFn: () => metadataService.getTimezoneNames(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Hook to refresh the timezone cache
 */
export const useRefreshTimezoneCache = () => {
  return {
    refreshCache: async () => {
      try {
        await metadataService.refreshTimezoneCache();
        // You might want to invalidate React Query cache here
        // queryClient.invalidateQueries({ queryKey: ['timezones'] });
      } catch (error) {
        console.error('Failed to refresh timezone cache:', error);
        throw error;
      }
    }
  };
};
