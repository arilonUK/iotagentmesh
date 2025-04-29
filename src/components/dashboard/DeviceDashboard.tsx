
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardLayout, DashboardGrid } from './DashboardLayout';
import { DeviceOverviewCard } from './DeviceOverviewCard';
import { LatestReadingsCard } from './LatestReadingsCard';
import { DeviceStatsCard } from './DeviceStatsCard';
import { Device } from '@/types/device';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MultiSeriesChart } from '@/components/ui/charts';

interface DeviceDashboardProps {
  device: Device | null;
  isLoading: boolean;
  error: string | null;
}

export const DeviceDashboard = ({ device, isLoading, error }: DeviceDashboardProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Mock data for demonstration
  const temperatureData = [
    { name: '00:00', value: 22 },
    { name: '04:00', value: 21 },
    { name: '08:00', value: 23 },
    { name: '12:00', value: 26 },
    { name: '16:00', value: 25 },
    { name: '20:00', value: 23 }
  ];
  
  const humidityData = [
    { name: '00:00', value: 65 },
    { name: '04:00', value: 67 },
    { name: '08:00', value: 60 },
    { name: '12:00', value: 54 },
    { name: '16:00', value: 58 },
    { name: '20:00', value: 63 }
  ];
  
  const energyData = [
    { name: 'Mon', value: 230 },
    { name: 'Tue', value: 245 },
    { name: 'Wed', value: 235 },
    { name: 'Thu', value: 260 },
    { name: 'Fri', value: 280 },
    { name: 'Sat', value: 210 },
    { name: 'Sun', value: 190 }
  ];
  
  // Modified to use 'name' instead of 'time' for the MultiSeriesChart
  const multiData = [
    { name: '00:00', temperature: 22, humidity: 65 },
    { name: '04:00', temperature: 21, humidity: 67 },
    { name: '08:00', temperature: 23, humidity: 60 },
    { name: '12:00', temperature: 26, humidity: 54 },
    { name: '16:00', temperature: 25, humidity: 58 },
    { name: '20:00', temperature: 23, humidity: 63 }
  ];
  
  const handleRefresh = () => {
    toast({
      title: "Refreshing data",
      description: "Fetching the latest device readings..."
    });
  };
  
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
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-0">
          <DashboardGrid>
            <DeviceOverviewCard 
              device={device!} 
              loading={isLoading} 
              error={error}
            />
            <LatestReadingsCard 
              deviceId={device?.id || ''} 
              readings={[]} 
              loading={isLoading} 
              onRefresh={handleRefresh}
            />
          </DashboardGrid>
          
          <div className="mt-4">
            <DeviceStatsCard
              deviceId={device?.id || ''}
              title="Temperature (24h)"
              data={temperatureData}
              categories={['value']}
              index="name"
              loading={isLoading}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="charts" className="mt-0">
          <DashboardGrid>
            <DeviceStatsCard
              deviceId={device?.id || ''}
              title="Temperature (24h)"
              description="Temperature readings over the last 24 hours"
              data={temperatureData}
              categories={['value']}
              index="name"
              loading={isLoading}
            />
            <DeviceStatsCard
              deviceId={device?.id || ''}
              title="Humidity (24h)"
              description="Humidity readings over the last 24 hours"
              data={humidityData}
              categories={['value']}
              index="name"
              loading={isLoading}
            />
          </DashboardGrid>
          
          <div className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Temperature & Humidity Correlation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <MultiSeriesChart
                    data={multiData}
                    index="name"
                    series={[
                      { dataKey: 'temperature', type: 'line', color: '#7E69AB', yAxisId: 'left' },
                      { dataKey: 'humidity', type: 'area', color: '#0EA5E9', yAxisId: 'right' }
                    ]}
                    dualYAxis
                    leftAxisValueFormatter={(value) => `${value}°C`}
                    rightAxisValueFormatter={(value) => `${value}%`}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-0">
          <DashboardGrid>
            <DeviceStatsCard
              deviceId={device?.id || ''}
              title="Energy Usage"
              description="Daily energy consumption over the last week"
              data={energyData}
              categories={['value']}
              index="name"
              loading={isLoading}
            />
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Avg. Temperature</p>
                      <p className="text-2xl font-bold">24.2°C</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Avg. Humidity</p>
                      <p className="text-2xl font-bold">62.8%</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Energy</p>
                      <p className="text-2xl font-bold">1,450W</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Uptime</p>
                      <p className="text-2xl font-bold">98.2%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </DashboardGrid>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};
