
import React from 'react';
import * as RechartsPrimitive from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { BaseChartProps, defaultColors, getDefaultValueFormatter, chartClasses } from './chart-utils';

export interface ScatterChartProps extends BaseChartProps {
  xAxisValueFormatter?: (value: number) => string;
  dotSize?: number;
  activeDotSize?: number;
  shape?: 'circle' | 'square' | 'triangle' | 'wye';
}

export function ScatterChart({
  data,
  categories,
  index,
  colors = defaultColors,
  height = 300,
  valueFormatter = getDefaultValueFormatter,
  xAxisValueFormatter = getDefaultValueFormatter,
  className,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  showXAxis = true,
  showYAxis = true,
  dotSize = 60,
  activeDotSize = 80,
  shape = 'circle',
}: ScatterChartProps) {
  // Generate a unique config ID for each category to avoid styling conflicts
  const chartConfig = categories.reduce((acc, category, index) => {
    acc[category] = { 
      color: colors[index % colors.length]
    };
    return acc;
  }, {} as Record<string, { color: string }>);

  return (
    <div className={chartClasses.base + ' ' + (className || '')} style={{ height }}>
      <ChartContainer className="h-full" config={chartConfig} data-testid="scatter-chart">
        <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
          <RechartsPrimitive.ScatterChart
            margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
          >
            {showGrid && (
              <RechartsPrimitive.CartesianGrid 
                strokeDasharray="3 3" 
                stroke="var(--border)"
                strokeOpacity={0.8}
              />
            )}
            
            {showXAxis && (
              <RechartsPrimitive.XAxis
                dataKey={index}
                type="number"
                tickLine={false}
                axisLine={false}
                padding={{ left: 16, right: 16 }}
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickFormatter={xAxisValueFormatter}
                className={chartClasses.axisLabel}
              />
            )}
            
            {showYAxis && (
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
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) {
                    return null;
                  }
                  const xValue = payload[0].payload[index];
                  const yValue = payload[0].value;
                  
                  return (
                    <div className={chartClasses.tooltip}>
                      <p className="text-sm font-medium">
                        {`${index}: ${xAxisValueFormatter(xValue as number)}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {`${payload[0].name}: ${valueFormatter(yValue as number)}`}
                      </p>
                    </div>
                  );
                }}
              />
            )}
            
            {categories.map((category, i) => (
              <RechartsPrimitive.Scatter
                key={category}
                name={category}
                data={data}
                fill={colors[i % colors.length]}
                dataKey={category}
                xAxisId={0}
                yAxisId={0}
              >
                <RechartsPrimitive.Cell />
                <RechartsPrimitive.LabelList />
              </RechartsPrimitive.Scatter>
            ))}
            
            {showLegend && (
              <ChartLegend>
                <ChartLegendContent />
              </ChartLegend>
            )}
          </RechartsPrimitive.ScatterChart>
        </RechartsPrimitive.ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
