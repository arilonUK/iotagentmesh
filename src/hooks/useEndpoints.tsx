import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EndpointConfig, EndpointFormData } from '@/types/endpoint';
import { 
  fetchEndpoints, 
  createEndpoint, 
  updateEndpoint, 
  deleteEndpoint,
  triggerEndpoint
} from '@/services/endpoints';

export const useEndpoints = (organizationId?: string) => {
  const queryClient = useQueryClient();

  const {
    data: endpoints = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['endpoints', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      return await fetchEndpoints(organizationId);
    },
    enabled: !!organizationId,
  });

  const createEndpointMutation = useMutation({
    mutationFn: async (endpointData: EndpointFormData) => {
      if (!organizationId) throw new Error('Organization ID is required');
      return await createEndpoint(organizationId, endpointData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['endpoints', organizationId] });
    }
  });

  const updateEndpointMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EndpointFormData> }) => {
      return await updateEndpoint(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['endpoints', organizationId] });
    }
  });

  const deleteEndpointMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteEndpoint(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['endpoints', organizationId] });
    }
  });

  const triggerEndpointMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data?: any }) => {
      return await triggerEndpoint(id, data);
    }
  });

  return {
    endpoints,
    isLoading,
    error,
    refetch,
    createEndpoint: createEndpointMutation.mutate,
    updateEndpoint: updateEndpointMutation.mutate,
    deleteEndpoint: deleteEndpointMutation.mutate,
    triggerEndpoint: triggerEndpointMutation.mutate,
    isCreating: createEndpointMutation.isPending,
    isUpdating: updateEndpointMutation.isPending,
    isDeleting: deleteEndpointMutation.isPending,
    isTriggering: triggerEndpointMutation.isPending
  };
};
