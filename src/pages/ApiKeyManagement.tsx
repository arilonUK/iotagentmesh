
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
  const { profile } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showNewKey, setShowNewKey] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (profile?.default_organization_id) {
      loadApiKeys();
    }
  }, [profile?.default_organization_id]);

  const loadApiKeys = async () => {
    if (!profile?.default_organization_id) return;
    
    setLoading(true);
    try {
      const keys = await apiKeyService.getApiKeys(profile.default_organization_id);
      setApiKeys(keys);
    } catch (error) {
      console.error('Error loading API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateKey = async (formData: NewApiKeyFormData) => {
    if (!profile?.default_organization_id) {
      toast.error('No organization selected');
      return;
    }

    try {
      const response = await apiKeyService.createApiKey(profile.default_organization_id, formData);
      setApiKeys([response.api_key, ...apiKeys]);
      setShowNewKey(response.full_key);
      toast.success('API key created successfully');
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
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
            Manage your existing API keys and their permissions
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
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
