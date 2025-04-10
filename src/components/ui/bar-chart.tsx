
import React from 'react';
import * as RechartsPrimitive from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface BarChartProps {
  data: Array<Record<string, any>>;
  categories: string[];
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
}

export function BarChart({
  data,
  categories,
  index,
  colors = ['#2563eb'],
  valueFormatter = (value: number) => `${value}`,
  className,
}: BarChartProps) {
  return (
    <ChartContainer className={className} config={{}} data-testid="bar-chart">
      <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
        <RechartsPrimitive.BarChart
          data={data}
          margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
        >
          <RechartsPrimitive.CartesianGrid vertical={false} strokeDasharray="3 3" />
          <RechartsPrimitive.XAxis
            dataKey={index}
            tickLine={false}
            axisLine={false}
            padding={{ left: 16, right: 16 }}
            stroke="#888888"
            fontSize={12}
          />
          <RechartsPrimitive.YAxis
            tickLine={false}
            axisLine={false}
            stroke="#888888"
            fontSize={12}
            tickFormatter={valueFormatter}
          />
          <ChartTooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) {
                return null;
              }
              return (
                <ChartTooltipContent
                  className="rounded-lg border bg-background p-2 shadow-md"
                  formatter={(value) => [valueFormatter(value as number)]}
                />
              );
            }}
          />
          {categories.map((category, i) => (
            <RechartsPrimitive.Bar
              key={category}
              dataKey={category}
              fill={colors[i % colors.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsPrimitive.BarChart>
      </RechartsPrimitive.ResponsiveContainer>
    </ChartContainer>
  );
}
