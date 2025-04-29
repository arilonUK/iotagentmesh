
import React, { useState } from 'react';
import { DashboardCard } from './DashboardCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, BarChart, AreaChart } from '@/components/ui/charts';
import { ChartDataPoint } from '@/components/ui/charts/chart-utils';

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
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart
            data={data}
            categories={categories}
            index={index}
            valueFormatter={(value) => `${value}`}
          />
        );
      case 'area':
        return (
          <AreaChart
            data={data}
            categories={categories}
            index={index}
            valueFormatter={(value) => `${value}`}
            curved
          />
        );
      case 'line':
      default:
        return (
          <LineChart
            data={data}
            categories={categories}
            index={index}
            valueFormatter={(value) => `${value}`}
            curved
          />
        );
    }
  };
  
  return (
    <DashboardCard
      title={title}
      description={description}
      loading={loading}
      error={error}
      headerAction={
        <Select value={chartType} onValueChange={(value: 'line' | 'bar' | 'area') => setChartType(value)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Chart type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="line">Line Chart</SelectItem>
            <SelectItem value="bar">Bar Chart</SelectItem>
            <SelectItem value="area">Area Chart</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      <div className="h-[300px] w-full overflow-hidden">
        {renderChart()}
      </div>
    </DashboardCard>
  );
};
