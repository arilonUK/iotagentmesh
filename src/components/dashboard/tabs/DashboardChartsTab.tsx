
import React from 'react';
import { DashboardGrid } from '../DashboardLayout';
import { DeviceStatsCard } from '../DeviceStatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MultiSeriesChart } from '@/components/ui/charts';
import { Device } from '@/types/device';

import { ChartDataPoint } from '@/components/ui/charts/chart-utils';
import { MultiDataPoint } from '../DeviceDashboardData';

interface DashboardChartsTabProps {
  device: Device | null;
  isLoading: boolean;
  error: string | null;
  temperatureData: ChartDataPoint[];
  humidityData: ChartDataPoint[];
  multiData: MultiDataPoint[];
}

export const DashboardChartsTab = ({
  device,
  isLoading,
  error,
  temperatureData,
  humidityData,
  multiData
}: DashboardChartsTabProps) => {
  return (
    <>
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
          <CardContent className="overflow-hidden">
            <div className="h-[300px] w-full">
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
    </>
  );
};
