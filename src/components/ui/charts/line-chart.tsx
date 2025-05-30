
import React from 'react';
import * as RechartsPrimitive from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { BaseChartProps, defaultColors, getDefaultValueFormatter, chartClasses } from './chart-utils';

export interface LineChartProps extends BaseChartProps {
  curved?: boolean;
  strokeWidth?: number;
  dotSize?: number;
  activeDotSize?: number;
  fillOpacity?: number;
  areaChart?: boolean;
}

export function LineChart({
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
  curved = false,
  strokeWidth = 2,
  dotSize = 4,
  activeDotSize = 6,
  fillOpacity = 0,
  areaChart = false,
}: LineChartProps) {
  // Generate a unique config ID for each category to avoid styling conflicts
  const chartConfig = categories.reduce((acc, category, index) => {
    acc[category] = { 
      color: colors[index % colors.length]
    };
    return acc;
  }, {} as Record<string, { color: string }>);

  return (
    <div className={chartClasses.base + ' ' + (className || '')} style={{ height, width: '100%' }}>
      <ChartContainer className="h-full w-full" config={chartConfig} data-testid="line-chart">
        <RechartsPrimitive.ResponsiveContainer width="99%" height="99%">
          <RechartsPrimitive.ComposedChart
            data={data}
            margin={{ top: 5, right: 5, bottom: 20, left: 5 }}
          >
            {showGrid && (
              <RechartsPrimitive.CartesianGrid 
                vertical={false} 
                strokeDasharray="3 3" 
                stroke="var(--border)"
                strokeOpacity={0.8}
              />
            )}
            
            {showXAxis && (
              <RechartsPrimitive.XAxis
                dataKey={index}
                tickLine={false}
                axisLine={false}
                padding={{ left: 5, right: 5 }}
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickFormatter={(value) => String(value)}
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
              areaChart ? (
                <RechartsPrimitive.Area
                  key={category}
                  dataKey={category}
                  stroke={colors[i % colors.length]}
                  fill={colors[i % colors.length]}
                  fillOpacity={fillOpacity}
                  strokeWidth={strokeWidth}
                  type={curved ? "monotone" : "linear"}
                  dot={{ r: dotSize, strokeWidth, fill: "#fff" }}
                  activeDot={{ r: activeDotSize, strokeWidth, fill: "#fff" }}
                />
              ) : (
                <RechartsPrimitive.Line
                  key={category}
                  dataKey={category}
                  stroke={colors[i % colors.length]}
                  fill={colors[i % colors.length]}
                  fillOpacity={fillOpacity}
                  strokeWidth={strokeWidth}
                  type={curved ? "monotone" : "linear"}
                  dot={{ r: dotSize, strokeWidth, fill: "#fff" }}
                  activeDot={{ r: activeDotSize, strokeWidth, fill: "#fff" }}
                />
              )
            ))}
            
            {showLegend && (
              <ChartLegend>
                <ChartLegendContent />
              </ChartLegend>
            )}
          </RechartsPrimitive.ComposedChart>
        </RechartsPrimitive.ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}

export function AreaChart(props: Omit<LineChartProps, 'areaChart'>) {
  return <LineChart {...props} areaChart fillOpacity={0.2} />;
}
