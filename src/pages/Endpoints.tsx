
import { Card, CardContent } from '@/components/ui/card';
import { EndpointManager } from '@/components/endpoints/EndpointManager';
import { NoOrganization } from '@/components/endpoints/NoOrganization';
import { useEndpointManager } from '@/hooks/useEndpointManager';
import { EndpointFormData } from '@/types/endpoint';

export default function Endpoints() {
  const {
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
  } = useEndpointManager();

  const handleUpdateSubmit = (data: EndpointFormData) => {
    const endpoint = endpoints.find(e => 
      e.name === data.name || 
      (data.id && e.id === data.id)
    );
    
    if (endpoint) {
      handleUpdateEndpoint(data, endpoint.id);
    } else {
      console.error('Cannot find endpoint to update');
    }
  };

  return (
    <div className="space-y-8">
      {!isEmbedded && (
        <div>
          <h1 className="text-2xl font-bold mb-2">Endpoints</h1>
          <p className="text-muted-foreground">
            Connect your devices to external services and applications
          </p>
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <EndpointManager
            endpoints={endpoints}
            isLoading={isLoading}
            isCreating={isCreating}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
            isTriggering={isTriggering}
            onCreateEndpoint={handleCreateEndpoint}
            onUpdateEndpoint={handleUpdateSubmit}
            onDeleteEndpoint={handleDeleteEndpoint}
            onToggleEndpoint={handleToggleEndpoint}
            onTriggerEndpoint={handleTriggerEndpoint}
            isEmbedded={isEmbedded}
          />
        </CardContent>
      </Card>

      {!organizationId && <NoOrganization />}
    </div>
  );
}
