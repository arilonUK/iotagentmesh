
import React from 'react';
import * as RechartsPrimitive from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { BaseChartProps, defaultColors, getDefaultValueFormatter, chartClasses } from './chart-utils';

type SeriesType = 'bar' | 'line' | 'area';

export interface SeriesConfig {
  dataKey: string;
  type: SeriesType;
  color?: string;
  yAxisId?: 'left' | 'right';
  strokeWidth?: number;
  fillOpacity?: number;
  barSize?: number;
}

export interface MultiSeriesChartProps extends Omit<BaseChartProps, 'categories'> {
  series: SeriesConfig[];
  dualYAxis?: boolean;
  rightAxisValueFormatter?: (value: number) => string;
  leftAxisValueFormatter?: (value: number) => string;
  syncId?: string;
}

export function MultiSeriesChart({
  data,
  index,
  series,
  colors = defaultColors,
  height = 300,
  valueFormatter = getDefaultValueFormatter,
  leftAxisValueFormatter = valueFormatter,
  rightAxisValueFormatter = valueFormatter,
  className,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  showXAxis = true,
  showYAxis = true,
  dualYAxis = false,
  syncId,
}: MultiSeriesChartProps) {
  // Generate a unique config ID for each series to avoid styling conflicts
  const chartConfig = series.reduce((acc, s, index) => {
    acc[s.dataKey] = { 
      color: s.color || colors[index % colors.length]
    };
    return acc;
  }, {} as Record<string, { color: string }>);

  // Assign default yAxisId if not provided
  const seriesWithAxis = series.map(s => ({
    ...s,
    yAxisId: s.yAxisId || (dualYAxis ? 'left' : undefined),
    color: s.color || colors[series.indexOf(s) % colors.length]
  }));

  return (
    <div className={chartClasses.base + ' ' + (className || '')} style={{ height }}>
      <ChartContainer className="h-full" config={chartConfig} data-testid="multi-series-chart">
        <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
          <RechartsPrimitive.ComposedChart
            data={data}
            margin={{ top: 16, right: dualYAxis ? 24 : 16, bottom: 16, left: 16 }}
            syncId={syncId}
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
                padding={{ left: 16, right: 16 }}
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickFormatter={(value) => String(value)}
                className={chartClasses.axisLabel}
              />
            )}
            
            {showYAxis && (
              <RechartsPrimitive.YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickFormatter={leftAxisValueFormatter}
                className={chartClasses.axisLabel}
              />
            )}
            
            {showYAxis && dualYAxis && (
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
                    <div className={chartClasses.tooltip}>
                      <p className="text-sm font-medium mb-1">
                        {String(payload[0]?.payload[index] || '')}
                      </p>
                      {payload.map((entry, idx) => {
                        const seriesConfig = seriesWithAxis.find(s => s.dataKey === entry.dataKey);
                        const formatter = seriesConfig?.yAxisId === 'right' 
                          ? rightAxisValueFormatter 
                          : leftAxisValueFormatter;
                        
                        return (
                          <div 
                            key={`item-${idx}`} 
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="flex items-center">
                              <span 
                                className="inline-block w-2 h-2 mr-1 rounded-full" 
                                style={{ backgroundColor: entry.color }} 
                              />
                              <span className="mr-2">{entry.name}:</span>
                            </span>
                            <span className="font-medium">
                              {formatter(entry.value as number)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                }}
              />
            )}
            
            {seriesWithAxis.map((s) => {
              if (s.type === 'line') {
                return (
                  <RechartsPrimitive.Line
                    key={s.dataKey}
                    type="monotone"
                    dataKey={s.dataKey}
                    yAxisId={s.yAxisId}
                    stroke={s.color}
                    strokeWidth={s.strokeWidth || 2}
                    dot={{ r: 4, strokeWidth: s.strokeWidth || 2, fill: "#fff" }}
                    activeDot={{ r: 6, strokeWidth: s.strokeWidth || 2, fill: "#fff" }}
                  />
                );
              } else if (s.type === 'area') {
                return (
                  <RechartsPrimitive.Area
                    key={s.dataKey}
                    type="monotone"
                    dataKey={s.dataKey}
                    yAxisId={s.yAxisId}
                    stroke={s.color}
                    fill={s.color}
                    strokeWidth={s.strokeWidth || 2}
                    fillOpacity={s.fillOpacity || 0.2}
                    dot={{ r: 4, strokeWidth: s.strokeWidth || 2, fill: "#fff" }}
                    activeDot={{ r: 6, strokeWidth: s.strokeWidth || 2, fill: "#fff" }}
                  />
                );
              } else {
                return (
                  <RechartsPrimitive.Bar
                    key={s.dataKey}
                    dataKey={s.dataKey}
                    yAxisId={s.yAxisId}
                    fill={s.color}
                    fillOpacity={s.fillOpacity || 1}
                    barSize={s.barSize}
                    radius={[4, 4, 0, 0]}
                  />
                );
              }
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
