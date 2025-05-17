
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionScheduler } from '@/components/actions/ActionScheduler';
import { ConditionalTriggers } from '@/components/actions/ConditionalTriggers';
import { ActionTemplates } from '@/components/actions/ActionTemplates';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ApiKeyManagement from './ApiKeyManagement';
import Endpoints from './Endpoints';

export default function IntegrationsAndConnectivity() {
  const [activeTab, setActiveTab] = useState('endpoints');
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Integrations & Connectivity</h1>
        <p className="text-muted-foreground">
          Manage connections, webhooks, integrations and device actions
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-6">
          <TabsTrigger value="endpoints">External Endpoints</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="oauth">OAuth Connections</TabsTrigger>
          <TabsTrigger value="actions">Device Actions</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="endpoints" className="mt-0">
          <Endpoints />
        </TabsContent>
        
        <TabsContent value="api-keys" className="mt-0">
          <ApiKeyManagement />
        </TabsContent>
        
        <TabsContent value="oauth" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>OAuth Connections</CardTitle>
              <CardDescription>
                Connect third-party services using OAuth authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">Manage your OAuth connections to external services</p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add OAuth Connection
                </Button>
              </div>
              <div className="text-center py-10 border border-dashed rounded-lg">
                <p className="text-muted-foreground">No OAuth connections configured yet</p>
                <Button variant="outline" className="mt-4">
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="actions" className="mt-0">
          <Tabs defaultValue="scheduler" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="scheduler">Action Scheduler</TabsTrigger>
              <TabsTrigger value="triggers">Conditional Triggers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="scheduler" className="mt-0">
              <ActionScheduler />
            </TabsContent>
            
            <TabsContent value="triggers" className="mt-0">
              <ConditionalTriggers />
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        <TabsContent value="templates" className="mt-0">
          <ActionTemplates />
        </TabsContent>
      </Tabs>
    </div>
  );
}
