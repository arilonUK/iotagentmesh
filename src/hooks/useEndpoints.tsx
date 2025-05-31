
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EndpointConfig, EndpointFormData } from '@/types/endpoint';
import { endpointsApiService } from '@/services/api/endpointsApiService';
import { toast } from 'sonner';

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
      console.log('Fetching endpoints for org:', organizationId);
      return await endpointsApiService.fetchEndpoints();
    },
    enabled: !!organizationId,
  });

  const createEndpointMutation = useMutation({
    mutationFn: async (endpointData: EndpointFormData) => {
      if (!organizationId) throw new Error('Organization ID is required');
      console.log('Creating endpoint with org:', organizationId, 'data:', endpointData);
      const result = await endpointsApiService.createEndpoint(endpointData);
      if (!result) throw new Error('Failed to create endpoint');
      return result;
    },
    onSuccess: (data) => {
      console.log('Endpoint created successfully, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['endpoints', organizationId] });
    },
    onError: (error: any) => {
      console.error('Error in createEndpointMutation:', error);
      toast.error(`Error creating endpoint: ${error?.message || 'Unknown error'}`);
    }
  });

  const updateEndpointMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EndpointFormData> }) => {
      console.log('Updating endpoint:', id, 'with data:', data);
      const success = await endpointsApiService.updateEndpoint(id, data);
      if (!success) throw new Error('Failed to update endpoint');
      return success;
    },
    onSuccess: () => {
      console.log('Endpoint updated successfully, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['endpoints', organizationId] });
    },
    onError: (error: any) => {
      console.error('Error in updateEndpointMutation:', error);
      toast.error(`Error updating endpoint: ${error?.message || 'Unknown error'}`);
    }
  });

  const deleteEndpointMutation = useMutation({
    mutationFn: async (id: string) => {
      const success = await endpointsApiService.deleteEndpoint(id);
      if (!success) throw new Error('Failed to delete endpoint');
      return success;
    },
    onSuccess: () => {
      toast.success('Endpoint deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['endpoints', organizationId] });
    },
    onError: (error: any) => {
      console.error('Error in deleteEndpointMutation:', error);
      toast.error(`Error deleting endpoint: ${error?.message || 'Unknown error'}`);
    }
  });

  const triggerEndpointMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data?: any }) => {
      const result = await endpointsApiService.triggerEndpoint(id, data);
      if (!result) throw new Error('Failed to trigger endpoint');
      return result;
    },
    onSuccess: () => {
      toast.success('Endpoint triggered successfully');
    },
    onError: (error: any) => {
      console.error('Error in triggerEndpointMutation:', error);
      toast.error(`Error triggering endpoint: ${error?.message || 'Unknown error'}`);
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
