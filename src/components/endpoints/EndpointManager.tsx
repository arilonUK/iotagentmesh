
import { useState } from 'react';
import { EndpointConfig, EndpointFormData } from '@/types/endpoint';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import EndpointList from '@/components/endpoints/EndpointList';
import EndpointForm from '@/components/endpoints/EndpointForm';

interface EndpointManagerProps {
  endpoints: EndpointConfig[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isTriggering: boolean;
  onCreateEndpoint: (data: EndpointFormData) => void;
  onUpdateEndpoint: (data: EndpointFormData) => void;
  onDeleteEndpoint: (id: string) => void;
  onToggleEndpoint: (id: string, enabled: boolean) => void;
  onTriggerEndpoint: (id: string) => void;
  isEmbedded: boolean;
}

export const EndpointManager = ({
  endpoints,
  isLoading,
  isCreating: isSubmittingCreate,
  isUpdating: isSubmittingUpdate,
  isDeleting,
  isTriggering,
  onCreateEndpoint,
  onUpdateEndpoint,
  onDeleteEndpoint,
  onToggleEndpoint,
  onTriggerEndpoint,
  isEmbedded
}: EndpointManagerProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editEndpoint, setEditEndpoint] = useState<EndpointConfig | null>(null);
  const [activeTab, setActiveTab] = useState<string>('list');

  const startCreating = () => {
    setIsCreating(true);
    setEditEndpoint(null);
    setActiveTab('form');
  };

  const startEditing = (endpoint: EndpointConfig) => {
    console.log('Editing endpoint:', endpoint);
    setEditEndpoint(endpoint);
    setIsCreating(false);
    setActiveTab('form');
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditEndpoint(null);
    setActiveTab('list');
  };

  const handleCreateSubmit = async (data: EndpointFormData) => {
    console.log('Creating endpoint with data:', data);
    onCreateEndpoint(data);
    setIsCreating(false);
    setActiveTab('list');
  };

  const handleUpdateSubmit = async (data: EndpointFormData) => {
    console.log('Updating endpoint with data:', data);
    if (!editEndpoint) return;
    onUpdateEndpoint(data);
    setEditEndpoint(null);
    setActiveTab('list');
  };

  return (
    <div className="space-y-8">
      {!isEmbedded && (
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
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
      )}

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
            onDelete={onDeleteEndpoint}
            onToggle={onToggleEndpoint}
            onTrigger={onTriggerEndpoint}
            onCreateClick={startCreating}
          />
        </TabsContent>
        
        <TabsContent value="form" className="mt-0">
          {(isCreating || editEndpoint) && (
            <EndpointForm
              initialData={editEndpoint || undefined}
              onSubmit={editEndpoint ? handleUpdateSubmit : handleCreateSubmit}
              isSubmitting={editEndpoint ? isSubmittingUpdate : isSubmittingCreate}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
