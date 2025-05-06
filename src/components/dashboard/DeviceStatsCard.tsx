
import React, { useState } from 'react';
import { DashboardCard } from './DashboardCard';
import { ChartDataPoint } from '@/components/ui/charts/chart-utils';
import { ChartTypeSelector, ChartType } from './ChartTypeSelector';
import { ChartRenderer } from './ChartRenderer';

interface DeviceStatsCardProps {
  deviceId: string;
  title: string;
  data: ChartDataPoint[];
  categories: string[];
  index: string;
  loading?: boolean;
  error?: string | null;
  description?: string;
}

export const DeviceStatsCard = ({
  deviceId,
  title,
  data,
  categories,
  index,
  loading,
  error,
  description
}: DeviceStatsCardProps) => {
  const [chartType, setChartType] = useState<ChartType>('line');
  
  return (
    <DashboardCard
      title={title}
      description={description}
      loading={loading}
      error={error}
      headerAction={
        <ChartTypeSelector 
          value={chartType} 
          onValueChange={setChartType} 
        />
      }
    >
      <div className="h-[300px] w-full overflow-hidden">
        <ChartRenderer
          chartType={chartType}
          data={data}
          categories={categories}
          index={index}
          valueFormatter={(value) => `${value}`}
        />
      </div>
    </DashboardCard>
  );
};
