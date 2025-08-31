
import React from 'react';
import * as RechartsPrimitive from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { defaultColors, chartClasses } from './chart-utils';

interface ChartSeries {
  dataKey: string;
  type: 'line' | 'bar' | 'area';
  color?: string;
  yAxisId?: 'left' | 'right';
  strokeDasharray?: string;
  fillOpacity?: number;
}

export interface MultiSeriesChartProps {
  data: Array<Record<string, unknown>>;
  index: string;
  series: ChartSeries[];
  height?: number | string;
  className?: string;
  dualYAxis?: boolean;
  leftAxisValueFormatter?: (value: number) => string;
  rightAxisValueFormatter?: (value: number) => string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
}

export function MultiSeriesChart({
  data,
  index,
  series,
  height = 300,
  className,
  dualYAxis = false,
  leftAxisValueFormatter = (value) => `${value}`,
  rightAxisValueFormatter = (value) => `${value}`,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
}: MultiSeriesChartProps) {
  // Generate a config for chart colors
  const chartConfig = series.reduce((acc, s, i) => {
    acc[s.dataKey] = { 
      color: s.color || defaultColors[i % defaultColors.length]
    };
    return acc;
  }, {} as Record<string, { color: string }>);

  return (
    <div className={chartClasses.base + ' ' + (className || '')} style={{ height, width: '100%' }}>
      <ChartContainer className="h-full w-full" config={chartConfig} data-testid="multi-series-chart">
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
            
            <RechartsPrimitive.YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickFormatter={leftAxisValueFormatter}
              className={chartClasses.axisLabel}
            />
            
            {dualYAxis && (
              <RechartsPrimitive.YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickFormatter={rightAxisValueFormatter}
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
                      formatter={(value, name, item) => {
                        const seriesItem = series.find(s => s.dataKey === item.dataKey);
                        
                        if (seriesItem?.yAxisId === "right") {
                          return [rightAxisValueFormatter(value as number)];
                        }
                        return [leftAxisValueFormatter(value as number)];
                      }}
                    />
                  );
                }}
              />
            )}
            
            {series.map((s, i) => {
              const color = s.color || defaultColors[i % defaultColors.length];
              const yAxisId = s.yAxisId || "left";
              
              if (s.type === 'line') {
                return (
                  <RechartsPrimitive.Line
                    key={s.dataKey}
                    dataKey={s.dataKey}
                    stroke={color}
                    strokeWidth={2}
                    yAxisId={yAxisId}
                    dot={{ r: 3, strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 5, strokeWidth: 2, fill: "#fff" }}
                    strokeDasharray={s.strokeDasharray}
                    type="monotone"
                  />
                );
              }
              
              if (s.type === 'bar') {
                return (
                  <RechartsPrimitive.Bar
                    key={s.dataKey}
                    dataKey={s.dataKey}
                    fill={color}
                    yAxisId={yAxisId}
                    radius={4}
                  />
                );
              }
              
              if (s.type === 'area') {
                return (
                  <RechartsPrimitive.Area
                    key={s.dataKey}
                    dataKey={s.dataKey}
                    stroke={color}
                    fill={color}
                    yAxisId={yAxisId}
                    fillOpacity={s.fillOpacity || 0.2}
                    type="monotone"
                  />
                );
              }
              
              return null;
            })}
            
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
