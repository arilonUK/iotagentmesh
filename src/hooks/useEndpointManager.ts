
import { useAuth } from '@/contexts/auth';
import { useEndpoints } from '@/hooks/useEndpoints';
import { EndpointFormData } from '@/types/endpoint';
import { toast } from 'sonner';

export const useEndpointManager = () => {
  const { currentOrganization, organization } = useAuth();
  
  // Get organization ID from currentOrganization or fallback to organization
  const organizationId = currentOrganization?.id || organization?.id;
  
  // Check if we're inside an iframe to hide unnecessary UI elements
  const isEmbedded = window.self !== window.top;

  const { 
    endpoints, 
    isLoading,
    createEndpoint, 
    updateEndpoint, 
    deleteEndpoint,
    triggerEndpoint,
    isCreating,
    isUpdating,
    isDeleting,
    isTriggering,
    refetch
  } = useEndpoints(organizationId);

  const handleCreateEndpoint = (data: EndpointFormData) => {
    if (!organizationId) {
      toast.error('No organization selected');
      return;
    }
    
    createEndpoint(data, {
      onSuccess: () => {
        toast.success('Endpoint created successfully');
        // Force refresh data after creation
        setTimeout(() => refetch(), 500);
      },
      onError: (error) => {
        console.error('Create endpoint error:', error);
        toast.error(`Failed to create endpoint: ${error.message || 'Unknown error'}`);
      }
    });
  };

  const handleUpdateEndpoint = (data: EndpointFormData, endpointId: string) => {
    updateEndpoint({ id: endpointId, data }, {
      onSuccess: () => {
        toast.success('Endpoint updated successfully');
        // Force refresh data after update
        setTimeout(() => refetch(), 500);
      },
      onError: (error) => {
        console.error('Update endpoint error:', error);
        toast.error(`Failed to update endpoint: ${error.message || 'Unknown error'}`);
      }
    });
  };

  const handleToggleEndpoint = (id: string, enabled: boolean) => {
    console.log('Toggling endpoint:', id, 'to', enabled);
    updateEndpoint({ id, data: { enabled } }, {
      onSuccess: () => {
        toast.success(`Endpoint ${enabled ? 'enabled' : 'disabled'}`);
        // Force refresh data after toggle
        setTimeout(() => refetch(), 500);
      },
      onError: (error) => {
        console.error('Toggle endpoint error:', error);
        toast.error(`Failed to toggle endpoint: ${error.message || 'Unknown error'}`);
      }
    });
  };

  const handleDeleteEndpoint = (id: string) => {
    deleteEndpoint(id, {
      onSuccess: () => {
        toast.success('Endpoint deleted successfully');
        setTimeout(() => refetch(), 500);
      },
      onError: (error) => {
        console.error('Delete endpoint error:', error);
        toast.error(`Failed to delete endpoint: ${error.message || 'Unknown error'}`);
      }
    });
  };

  const handleTriggerEndpoint = (id: string) => {
    console.log('Triggering endpoint:', id);
    triggerEndpoint({ id }, {
      onSuccess: () => {
        toast.success('Endpoint triggered successfully');
      },
      onError: (error) => {
        console.error('Trigger endpoint error:', error);
        toast.error(`Failed to trigger endpoint: ${error.message || 'Unknown error'}`);
      }
    });
  };

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
