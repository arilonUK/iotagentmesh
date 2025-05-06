
import React from 'react';
import { DashboardGrid } from '../DashboardLayout';
import { DeviceStatsCard } from '../DeviceStatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Device } from '@/types/device';

interface DashboardAnalyticsTabProps {
  device: Device | null;
  isLoading: boolean;
  error: string | null;
  energyData: any[];
}

export const DashboardAnalyticsTab = ({
  device,
  isLoading,
  error,
  energyData
}: DashboardAnalyticsTabProps) => {
  return (
    <>
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
    </>
  );
};
