
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { endpointsApiService } from '@/services/api/endpointsApiService';
import { EndpointConfig, EndpointFormData } from '@/types/endpoint';
import { toast } from 'sonner';

export const useEndpointManager = () => {
  const { organization } = useAuth();
  const [endpoints, setEndpoints] = useState<EndpointConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);

  const organizationId = organization?.id;
  const isEmbedded = false; // This can be configured based on context

  const loadEndpoints = async () => {
    if (!organizationId) return;
    
    setIsLoading(true);
    try {
      const data = await endpointsApiService.fetchEndpoints();
      setEndpoints(data);
    } catch (error) {
      console.error('Error loading endpoints:', error);
      toast.error('Failed to load endpoints');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEndpoint = async (data: EndpointFormData) => {
    if (!organizationId) return;
    
    setIsCreating(true);
    try {
      const newEndpoint = await endpointsApiService.createEndpoint(data);
      if (newEndpoint) {
        setEndpoints(prev => [...prev, newEndpoint]);
        toast.success('Endpoint created successfully');
      }
    } catch (error) {
      console.error('Error creating endpoint:', error);
      toast.error('Failed to create endpoint');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateEndpoint = async (data: EndpointFormData, endpointId: string) => {
    setIsUpdating(true);
    try {
      const success = await endpointsApiService.updateEndpoint(endpointId, data);
      if (success) {
        setEndpoints(prev => 
          prev.map(endpoint => 
            endpoint.id === endpointId 
              ? { ...endpoint, ...data, updated_at: new Date().toISOString() }
              : endpoint
          )
        );
        toast.success('Endpoint updated successfully');
      }
    } catch (error) {
      console.error('Error updating endpoint:', error);
      toast.error('Failed to update endpoint');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteEndpoint = async (endpointId: string) => {
    setIsDeleting(true);
    try {
      const success = await endpointsApiService.deleteEndpoint(endpointId);
      if (success) {
        setEndpoints(prev => prev.filter(endpoint => endpoint.id !== endpointId));
        toast.success('Endpoint deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting endpoint:', error);
      toast.error('Failed to delete endpoint');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleEndpoint = async (endpointId: string, enabled: boolean) => {
    try {
      const success = await endpointsApiService.updateEndpoint(endpointId, { enabled });
      if (success) {
        setEndpoints(prev => 
          prev.map(endpoint => 
            endpoint.id === endpointId 
              ? { ...endpoint, enabled }
              : endpoint
          )
        );
        toast.success(`Endpoint ${enabled ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.error('Error toggling endpoint:', error);
      toast.error('Failed to toggle endpoint');
    }
  };

  const handleTriggerEndpoint = async (endpointId: string) => {
    setIsTriggering(true);
    try {
      const success = await endpointsApiService.triggerEndpoint(endpointId);
      if (success) {
        toast.success('Endpoint triggered successfully');
      }
    } catch (error) {
      console.error('Error triggering endpoint:', error);
      toast.error('Failed to trigger endpoint');
    } finally {
      setIsTriggering(false);
    }
  };

  useEffect(() => {
    loadEndpoints();
  }, [organizationId]);

  return {
    organizationId,
    endpoints,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isTriggering,
    isEmbedded,
    handleCreateEndpoint,
    handleUpdateEndpoint,
    handleDeleteEndpoint,
    handleToggleEndpoint,
    handleTriggerEndpoint
  };
};
