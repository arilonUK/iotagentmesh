
import React from 'react';
import * as RechartsPrimitive from "recharts";
import { ChartContainer } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { defaultColors, chartClasses } from './chart-utils';

export interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  valueFormatter?: (value: number) => string;
  label?: string;
  className?: string;
  colors?: string[];
  height?: number | string;
  thickness?: number;
  startAngle?: number;
  endAngle?: number;
}

export function GaugeChart({
  value,
  min = 0,
  max = 100,
  valueFormatter = (value) => `${value}`,
  label,
  className,
  colors = defaultColors,
  height = 200,
  thickness = 20,
  startAngle = 180,
  endAngle = 0,
}: GaugeChartProps) {
  // Ensure value is within bounds
  const boundedValue = Math.max(min, Math.min(max, value));
  const normalizedValue = ((boundedValue - min) / (max - min)) * 100;
  
  // Calculate color based on value
  let colorIndex = 0;
  if (normalizedValue < 33) colorIndex = 0;
  else if (normalizedValue < 66) colorIndex = 1;
  else colorIndex = 2;
  
  const chartConfig = {
    value: { color: colors[colorIndex] },
    background: { color: 'var(--muted)' },
  };
  
  // Data for the gauge
  const data = [
    { name: 'value', value: normalizedValue },
    { name: 'background', value: 100 - normalizedValue },
  ];
  
  return (
    <div className={cn(chartClasses.base, className)} style={{ height }}>
      <ChartContainer className="h-full" config={chartConfig} data-testid="gauge-chart">
        <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
          <RechartsPrimitive.PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <RechartsPrimitive.Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="100%"
              innerRadius={100 - thickness}
              outerRadius={100}
              startAngle={startAngle}
              endAngle={endAngle}
              paddingAngle={0}
              cornerRadius={0}
            />
            <RechartsPrimitive.Text
              x="50%"
              y="85%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground font-bold text-lg"
            >
              {valueFormatter(boundedValue)}
            </RechartsPrimitive.Text>
            {label && (
              <RechartsPrimitive.Text
                x="50%"
                y="95%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground text-xs"
              >
                {label}
              </RechartsPrimitive.Text>
            )}
          </RechartsPrimitive.PieChart>
        </RechartsPrimitive.ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
