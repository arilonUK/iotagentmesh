
import React from 'react';
import { DashboardGrid } from '../DashboardLayout';
import { DeviceOverviewCard } from '../DeviceOverviewCard';
import { LatestReadingsCard } from '../LatestReadingsCard';
import { DeviceStatsCard } from '../DeviceStatsCard';
import { useToast } from '@/hooks/use-toast';
import { Device } from '@/types/device';

interface DashboardOverviewTabProps {
  device: Device | null;
  isLoading: boolean;
  error: string | null;
  temperatureData: any[];
}

export const DashboardOverviewTab = ({
  device,
  isLoading,
  error,
  temperatureData
}: DashboardOverviewTabProps) => {
  const { toast } = useToast();
  
  const handleRefresh = () => {
    toast({
      title: "Refreshing data",
      description: "Fetching the latest device readings..."
    });
  };

  return (
    <>
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
    </>
  );
};
