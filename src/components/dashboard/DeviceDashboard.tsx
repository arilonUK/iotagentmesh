
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardLayout } from './DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Device } from '@/types/device';
import { DeviceDashboardData } from './DeviceDashboardData';
import { DashboardOverviewTab } from './tabs/DashboardOverviewTab';
import { DashboardChartsTab } from './tabs/DashboardChartsTab';
import { DashboardAnalyticsTab } from './tabs/DashboardAnalyticsTab';

interface DeviceDashboardProps {
  device: Device | null;
  isLoading: boolean;
  error: string | null;
}

export const DeviceDashboard = ({ device, isLoading, error }: DeviceDashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  if (!device && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No device selected</CardTitle>
        </CardHeader>
        <CardContent>
          Please select a device to view its dashboard.
        </CardContent>
      </Card>
    );
  }
  
  return (
    <DashboardLayout>
      <DeviceDashboardData device={device} isLoading={isLoading} error={error}>
        {({ temperatureData, humidityData, energyData, multiData }) => (
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-0">
              <DashboardOverviewTab
                device={device}
                isLoading={isLoading}
                error={error}
                temperatureData={temperatureData}
              />
            </TabsContent>
            
            <TabsContent value="charts" className="mt-0">
              <DashboardChartsTab
                device={device}
                isLoading={isLoading}
                error={error}
                temperatureData={temperatureData}
                humidityData={humidityData}
                multiData={multiData}
              />
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-0">
              <DashboardAnalyticsTab
                device={device}
                isLoading={isLoading}
                error={error}
                energyData={energyData}
              />
            </TabsContent>
          </Tabs>
        )}
      </DeviceDashboardData>
    </DashboardLayout>
  );
};
