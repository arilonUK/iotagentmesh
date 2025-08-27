
import { useQuery } from '@tanstack/react-query';
import { fetchOrganizationData } from '@/services/organizationEntityService';
import type { OrganizationData } from '@/types/organization';
import { useToast } from '@/hooks/use-toast';

export const useOrganizationData = (organizationId?: string, userId?: string) => {
  const { toast } = useToast();
  
  const {
    data: organizationData,
    isLoading,
    error,
    refetch
  } = useQuery<OrganizationData | null>({
    queryKey: ['organizationData', organizationId, userId],
    queryFn: async () => {
      if (!organizationId || !userId) {
        console.log('Missing organizationId or userId, skipping fetch');
        return null;
      }
      
      console.log('useOrganizationData: Fetching data for org:', organizationId);
      try {
        const result = await fetchOrganizationData(organizationId, userId);
        
        if (!result) {
          console.log('No organization data returned');
          return null;
        }
        
        console.log('useOrganizationData: Successfully fetched organization data');
        return result;
      } catch (err) {
        console.error('Error in useOrganizationData query function:', err);
        throw err;
      }
    },
    enabled: !!organizationId && !!userId,
    retry: 1,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  if (error) {
    console.error('Error in useOrganizationData hook:', error);
  }
  
  return {
    organizationData,
    isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    refetch
  };
};
