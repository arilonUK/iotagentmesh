
import React from 'react';
import * as RechartsPrimitive from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { BaseChartProps, defaultColors, getDefaultValueFormatter, chartClasses } from './chart-utils';

export interface BarChartProps extends BaseChartProps {
  stacked?: boolean;
  horizontal?: boolean;
  barRadius?: number;
  barGap?: number;
  barSize?: number;
}

export function BarChart({
  data,
  categories,
  index,
  colors = defaultColors,
  height = 300,
  valueFormatter = getDefaultValueFormatter,
  className,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  showXAxis = true,
  showYAxis = true,
  stacked = false,
  horizontal = false,
  barRadius = 4,
  barGap = 4,
  barSize,
}: BarChartProps) {
  // Generate a unique config ID for each category to avoid styling conflicts
  const chartConfig = categories.reduce((acc, category, index) => {
    acc[category] = { 
      color: colors[index % colors.length]
    };
    return acc;
  }, {} as Record<string, { color: string }>);
  
  return (
    <div className={chartClasses.base + ' ' + (className || '')} style={{ height, width: '100%' }}>
      <ChartContainer className="h-full w-full" config={chartConfig} data-testid="bar-chart">
        <RechartsPrimitive.ResponsiveContainer width="99%" height="99%">
          <RechartsPrimitive.BarChart
            data={data}
            margin={{ top: 5, right: 5, bottom: 20, left: 5 }}
            barGap={barGap}
            layout={horizontal ? "vertical" : "horizontal"}
          >
            {showGrid && (
              <RechartsPrimitive.CartesianGrid 
                vertical={!horizontal} 
                horizontal={horizontal} 
                strokeDasharray="3 3" 
                stroke="var(--border)"
                strokeOpacity={0.8}
              />
            )}
            
            {showXAxis && (
              horizontal ? 
                <RechartsPrimitive.YAxis
                  dataKey={index}
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  padding={{ top: 5, bottom: 5 }} // Modified from left/right to top/bottom
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickFormatter={(value) => String(value)}
                  className={chartClasses.axisLabel}
                /> :
                <RechartsPrimitive.XAxis
                  dataKey={index}
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  padding={{ left: 5, right: 5 }} // This is correct for XAxis
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickFormatter={(value) => String(value)}
                  className={chartClasses.axisLabel}
                />
            )}
            
            {showYAxis && (
              horizontal ?
                <RechartsPrimitive.XAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickFormatter={valueFormatter}
                  className={chartClasses.axisLabel}
                /> :
                <RechartsPrimitive.YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickFormatter={valueFormatter}
                  className={chartClasses.axisLabel}
                />
            )}
            
            {showTooltip && (
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) {
                    return null;
                  }
                  return (
                    <ChartTooltipContent
                      className={chartClasses.tooltip}
                      formatter={(value) => [valueFormatter(value as number)]}
                    />
                  );
                }}
              />
            )}
            
            {categories.map((category, i) => (
              <RechartsPrimitive.Bar
                key={category}
                dataKey={category}
                fill={colors[i % colors.length]}
                radius={barRadius}
                barSize={barSize}
                stackId={stacked ? "stack" : undefined}
              />
            ))}
            
            {showLegend && (
              <ChartLegend>
                <ChartLegendContent />
              </ChartLegend>
            )}
          </RechartsPrimitive.BarChart>
        </RechartsPrimitive.ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
