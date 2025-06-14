
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, BarChart3 } from 'lucide-react';
import SubscriptionManager from '@/components/billing/SubscriptionManager';
import UsageDashboard from '@/components/billing/UsageDashboard';

const Billing = () => {
  const [activeTab, setActiveTab] = useState('usage');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Billing & Usage</h1>
        <p className="text-muted-foreground">
          Manage your subscription and monitor your IoT platform usage.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Usage Dashboard
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Subscription Plans
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="usage" className="mt-6">
          <UsageDashboard />
        </TabsContent>
        
        <TabsContent value="subscription" className="mt-6">
          <SubscriptionManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Billing;
