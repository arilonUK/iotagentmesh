
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionScheduler } from '@/components/actions/ActionScheduler';
import { ConditionalTriggers } from '@/components/actions/ConditionalTriggers';
import { ActionTemplates } from '@/components/actions/ActionTemplates';

export default function IntegrationsAndConnectivity() {
  const [activeTab, setActiveTab] = useState('endpoints');
  
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
          <Card>
            <CardHeader>
              <CardTitle>Webhooks & External Endpoints</CardTitle>
              <CardDescription>
                Configure external services to receive data from your devices
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <iframe 
                src="/dashboard/endpoints" 
                className="w-full min-h-[700px] border-0"
                title="Endpoints configuration"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api-keys" className="mt-0">
          <iframe 
            src="/dashboard/api-keys" 
            className="w-full min-h-[700px] border-0"
            title="API Keys management"
          />
        </TabsContent>
        
        <TabsContent value="oauth" className="mt-0">
          <iframe 
            src="/dashboard/oauth" 
            className="w-full min-h-[700px] border-0"
            title="OAuth connections"
          />
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
