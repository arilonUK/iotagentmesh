
import React, { useState, useMemo } from 'react';
import { Device } from '@/types/device';

import { ChartDataPoint } from '@/components/ui/charts/chart-utils';

export interface MultiDataPoint {
  name: string;
  temperature: number;
  humidity: number;
}

export interface DeviceDashboardDataProps {
  device: Device | null;
  isLoading: boolean;
  error: string | null;
  children: (data: {
    temperatureData: ChartDataPoint[];
    humidityData: ChartDataPoint[];
    energyData: ChartDataPoint[];
    multiData: MultiDataPoint[];
  }) => React.ReactNode;
}

export const DeviceDashboardData: React.FC<DeviceDashboardDataProps> = ({ 
  device,
  isLoading, 
  error,
  children 
}) => {
  // Mock data for demonstration
  const temperatureData = useMemo(() => [
    { name: '00:00', value: 22 },
    { name: '04:00', value: 21 },
    { name: '08:00', value: 23 },
    { name: '12:00', value: 26 },
    { name: '16:00', value: 25 },
    { name: '20:00', value: 23 }
  ], []);
  
  const humidityData = useMemo(() => [
    { name: '00:00', value: 65 },
    { name: '04:00', value: 67 },
    { name: '08:00', value: 60 },
    { name: '12:00', value: 54 },
    { name: '16:00', value: 58 },
    { name: '20:00', value: 63 }
  ], []);
  
  const energyData = useMemo(() => [
    { name: 'Mon', value: 230 },
    { name: 'Tue', value: 245 },
    { name: 'Wed', value: 235 },
    { name: 'Thu', value: 260 },
    { name: 'Fri', value: 280 },
    { name: 'Sat', value: 210 },
    { name: 'Sun', value: 190 }
  ], []);
  
  // Combined data for multi-series chart
  const multiData = useMemo(() => [
    { name: '00:00', temperature: 22, humidity: 65 },
    { name: '04:00', temperature: 21, humidity: 67 },
    { name: '08:00', temperature: 23, humidity: 60 },
    { name: '12:00', temperature: 26, humidity: 54 },
    { name: '16:00', temperature: 25, humidity: 58 },
    { name: '20:00', temperature: 23, humidity: 63 }
  ], []);

  return (
    <>
      {children({
        temperatureData,
        humidityData,
        energyData,
        multiData
      })}
    </>
  );
};
