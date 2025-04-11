
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { useEndpoints } from '@/hooks/useEndpoints';
import { EndpointConfig, EndpointFormData } from '@/types/endpoint';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import EndpointList from '@/components/endpoints/EndpointList';
import EndpointForm from '@/components/endpoints/EndpointForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function Endpoints() {
  const { profile } = useAuth();
  const organizationId = profile?.default_organization_id;
  
  const [isCreating, setIsCreating] = useState(false);
  const [editEndpoint, setEditEndpoint] = useState<EndpointConfig | null>(null);
  const [activeTab, setActiveTab] = useState<string>('list');

  const { 
    endpoints, 
    isLoading,
    createEndpoint, 
    updateEndpoint, 
    deleteEndpoint,
    triggerEndpoint,
    isCreating: isSubmittingCreate,
    isUpdating: isSubmittingUpdate,
    isDeleting,
    isTriggering
  } = useEndpoints(organizationId);

  const handleCreateSubmit = (data: EndpointFormData) => {
    createEndpoint(data, {
      onSuccess: () => {
        setIsCreating(false);
        setActiveTab('list');
        toast.success('Endpoint created successfully');
      },
      onError: (error) => {
        toast.error('Failed to create endpoint');
        console.error('Create endpoint error:', error);
      }
    });
  };

  const handleUpdateSubmit = (data: EndpointFormData) => {
    if (!editEndpoint) return;

    updateEndpoint({ id: editEndpoint.id, data }, {
      onSuccess: () => {
        setEditEndpoint(null);
        setActiveTab('list');
        toast.success('Endpoint updated successfully');
      },
      onError: (error) => {
        toast.error('Failed to update endpoint');
        console.error('Update endpoint error:', error);
      }
    });
  };

  const handleToggleEndpoint = (id: string, enabled: boolean) => {
    updateEndpoint({ id, data: { enabled } }, {
      onSuccess: () => {
        toast.success(`Endpoint ${enabled ? 'enabled' : 'disabled'}`);
      },
      onError: (error) => {
        toast.error('Failed to update endpoint status');
        console.error('Toggle endpoint error:', error);
      }
    });
  };

  const handleTriggerEndpoint = (id: string) => {
    triggerEndpoint({ id }, {
      onSuccess: () => {
        toast.success('Endpoint triggered successfully');
      },
      onError: (error) => {
        toast.error('Failed to trigger endpoint');
        console.error('Trigger endpoint error:', error);
      }
    });
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditEndpoint(null);
    setActiveTab('form');
  };

  const startEditing = (endpoint: EndpointConfig) => {
    setEditEndpoint(endpoint);
    setIsCreating(false);
    setActiveTab('form');
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditEndpoint(null);
    setActiveTab('list');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Endpoints</h1>
          <p className="text-muted-foreground">
            Connect your devices to external services and applications
          </p>
        </div>
        
        {activeTab === 'list' && (
          <Button onClick={startCreating}>
            <Plus className="mr-2 h-4 w-4" />
            Create Endpoint
          </Button>
        )}

        {activeTab === 'form' && (
          <Button variant="outline" onClick={cancelForm}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="hidden">
          <TabsTrigger value="list">Endpoint List</TabsTrigger>
          <TabsTrigger value="form">Create/Edit Endpoint</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-0">
          <EndpointList
            endpoints={endpoints}
            isLoading={isLoading}
            onEdit={startEditing}
            onDelete={deleteEndpoint}
            onToggle={handleToggleEndpoint}
            onTrigger={handleTriggerEndpoint}
          />
        </TabsContent>
        
        <TabsContent value="form" className="mt-0">
          {(isCreating || editEndpoint) && (
            <EndpointForm
              initialData={editEndpoint || undefined}
              onSubmit={editEndpoint ? handleUpdateSubmit : handleCreateSubmit}
              isSubmitting={isCreating ? isSubmittingCreate : isSubmittingUpdate}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
