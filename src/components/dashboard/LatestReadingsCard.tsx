
import React from 'react';
import { DashboardCard } from './DashboardCard';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GaugeChart } from '@/components/ui/charts';

interface Reading {
  name: string;
  value: number;
  unit: string;
  min?: number;
  max?: number;
}

interface LatestReadingsCardProps {
  deviceId: string;
  readings: Reading[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export const LatestReadingsCard = ({
  deviceId,
  readings,
  loading,
  error,
  onRefresh
}: LatestReadingsCardProps) => {
  // Mock readings if not provided (for demo purposes)
  const displayReadings = readings.length > 0 ? readings : [
    { name: 'Temperature', value: 24, unit: '°C', min: 0, max: 40 },
    { name: 'Humidity', value: 65, unit: '%', min: 0, max: 100 },
    { name: 'Pressure', value: 1013, unit: 'hPa', min: 900, max: 1100 }
  ];

  return (
    <DashboardCard
      title="Latest Readings"
      loading={loading}
      error={error}
      headerAction={
        <Button variant="ghost" size="icon" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {displayReadings.map((reading, index) => (
          <div key={`${reading.name}-${index}`} className="flex flex-col items-center">
            <GaugeChart
              value={reading.value}
              min={reading.min || 0}
              max={reading.max || 100}
              valueFormatter={(value) => `${value}${reading.unit}`}
              label={reading.name}
              height={150}
            />
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};
