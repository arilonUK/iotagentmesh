
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ApiKey, NewApiKeyFormData } from '@/types/apiKey';
import { ApiKeyList } from '@/components/apiKeys/ApiKeyList';
import { ApiKeyForm } from '@/components/apiKeys/ApiKeyForm';
import { ApiKeyCreatedCard } from '@/components/apiKeys/ApiKeyCreatedCard';
import { apiKeyService } from '@/services/apiKeyService';

export default function ApiKeyManagement() {
  const { profile, organization } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showNewKey, setShowNewKey] = useState('');
  const [loading, setLoading] = useState(false);
  
  const organizationId = organization?.id;
  
  console.log('ApiKeyManagement - organizationId:', organizationId);
  console.log('ApiKeyManagement - profile:', profile);
  console.log('ApiKeyManagement - organization:', organization);
  
  useEffect(() => {
    if (organizationId) {
      loadApiKeys();
    }
  }, [organizationId]);

  const loadApiKeys = async () => {
    if (!organizationId) {
      console.log('No organization ID available for loading API keys');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Loading API keys for organization:', organizationId);
      const keys = await apiKeyService.getApiKeys(organizationId);
      setApiKeys(keys);
      console.log('Loaded API keys:', keys);
    } catch (error) {
      console.error('Error loading API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateKey = async (formData: NewApiKeyFormData) => {
    if (!organizationId) {
      console.error('No organization ID available for creating API key');
      toast.error('No organization selected. Please check your organization settings.');
      return;
    }

    console.log('Creating API key with organization:', organizationId, 'data:', formData);
    
    try {
      const response = await apiKeyService.createApiKey(organizationId, formData);
      console.log('API key created successfully:', response);
      setApiKeys([response.api_key, ...apiKeys]);
      setShowNewKey(response.full_key);
      toast.success('API key created successfully');
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    }
  };

  const handleRefreshKey = async (id: string): Promise<string> => {
    try {
      const newKey = await apiKeyService.refreshApiKey(id);
      // Reload API keys to get updated data
      await loadApiKeys();
      toast.success('API key refreshed successfully');
      return newKey;
    } catch (error) {
      console.error('Error refreshing API key:', error);
      toast.error('Failed to refresh API key');
      throw error;
    }
  };
  
  const handleToggleKey = async (id: string, active: boolean) => {
    try {
      const updatedKey = await apiKeyService.updateApiKey(id, { is_active: active });
      setApiKeys(apiKeys.map(key => 
        key.id === id ? updatedKey : key
      ));
      toast.success(`API key ${active ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling API key:', error);
      toast.error('Failed to update API key');
    }
  };
  
  const handleDeleteKey = async (id: string) => {
    try {
      await apiKeyService.deleteApiKey(id);
      setApiKeys(apiKeys.filter(key => key.id !== id));
      toast.success('API key deleted');
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to delete API key');
    }
  };
  
  // Show loading state while organization is being loaded
  if (loading && !organizationId) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">API Key Management</h1>
            <p className="text-muted-foreground">
              Loading organization data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no organization is available
  if (!organizationId) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">API Key Management</h1>
            <p className="text-muted-foreground">
              No organization available. Please check your organization settings.
            </p>
          </div>
        </div>
        
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              You need to be part of an organization to manage API keys.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">API Key Management</h1>
          <p className="text-muted-foreground">
            Create and manage API keys for programmatic access to your IoT platform
          </p>
        </div>
        
        <ApiKeyForm onCreateKey={handleCreateKey} />
      </div>
      
      {showNewKey && (
        <ApiKeyCreatedCard 
          apiKey={showNewKey} 
          onDismiss={() => setShowNewKey('')} 
        />
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Manage your existing API keys and their permissions. Refresh keys before they expire to maintain continuous access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">Loading API keys...</p>
            </div>
          ) : (
            <ApiKeyList 
              apiKeys={apiKeys}
              onDeleteKey={handleDeleteKey}
              onToggleKey={handleToggleKey}
              onRefreshKey={handleRefreshKey}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
