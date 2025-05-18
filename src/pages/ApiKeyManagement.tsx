
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ApiKey, NewApiKeyFormData } from '@/types/apiKey';
import { ApiKeyList } from '@/components/apiKeys/ApiKeyList';
import { ApiKeyForm } from '@/components/apiKeys/ApiKeyForm';
import { ApiKeyCreatedCard } from '@/components/apiKeys/ApiKeyCreatedCard';

export default function ApiKeyManagement() {
  const { profile } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Development Key',
      prefix: 'dev_key_xxxx',
      scopes: ['read', 'write'],
      created_at: new Date().toISOString(),
      expires_at: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
      last_used: new Date().toISOString(),
      is_active: true
    },
    {
      id: '2',
      name: 'Testing Key',
      prefix: 'test_key_xxxx',
      scopes: ['read'],
      created_at: new Date().toISOString(),
      expires_at: null,
      last_used: null,
      is_active: true
    }
  ]);
  const [showNewKey, setShowNewKey] = useState('');
  
  const handleCreateKey = (formData: NewApiKeyFormData) => {
    // In a real app, we would call an API to create the key and get back the full key
    const newKey = `${profile?.default_organization_id.substring(0, 8)}_${Math.random().toString(36).substring(2, 10)}`;
    const prefix = `${newKey.substring(0, 8)}...`;
    
    const newApiKey: ApiKey = {
      id: Math.random().toString(),
      name: formData.name,
      prefix,
      scopes: formData.scopes,
      created_at: new Date().toISOString(),
      expires_at: formData.expiration === 'never' ? null : 
        new Date(new Date().setMonth(new Date().getMonth() + parseInt(formData.expiration))).toISOString(),
      last_used: null,
      is_active: true
    };
    
    setApiKeys([...apiKeys, newApiKey]);
    setShowNewKey(newKey);
    
    toast.success('API key created successfully');
  };
  
  const handleToggleKey = (id: string, active: boolean) => {
    setApiKeys(apiKeys.map(key => 
      key.id === id ? { ...key, is_active: active } : key
    ));
    
    toast.success(`API key ${active ? 'activated' : 'deactivated'}`);
  };
  
  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
    toast.success('API key deleted');
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
          <ApiKeyList 
            apiKeys={apiKeys}
            onDeleteKey={handleDeleteKey}
            onToggleKey={handleToggleKey}
          />
        </CardContent>
      </Card>
    </div>
  );
}
