
import React from 'react';
import { LineChart, BarChart, AreaChart, ScatterChart } from '@/components/ui/charts';
import { ChartDataPoint } from '@/components/ui/charts/chart-utils';
import { ChartType } from './ChartTypeSelector';

interface ChartRendererProps {
  chartType: ChartType;
  data: ChartDataPoint[];
  categories: string[];
  index: string;
  valueFormatter?: (value: number) => string;
}

export const ChartRenderer = ({
  chartType,
  data,
  categories,
  index,
  valueFormatter = (value) => `${value}`,
}: ChartRendererProps) => {
  switch (chartType) {
    case 'bar':
      return (
        <BarChart
          data={data}
          categories={categories}
          index={index}
          valueFormatter={valueFormatter}
        />
      );
    case 'area':
      return (
        <AreaChart
          data={data}
          categories={categories}
          index={index}
          valueFormatter={valueFormatter}
          curved
        />
      );
    case 'scatter':
      return (
        <ScatterChart
          data={data}
          categories={categories}
          index={index}
          valueFormatter={valueFormatter}
        />
      );
    case 'line':
    default:
      return (
        <LineChart
          data={data}
          categories={categories}
          index={index}
          valueFormatter={valueFormatter}
          curved
        />
      );
  }
};
