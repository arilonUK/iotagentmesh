
import { ClassValue } from "clsx";
import { cn } from "@/lib/utils";

export type ChartDataPoint = {
  [key: string]: string | number;
};

export interface BaseChartProps {
  data: ChartDataPoint[];
  categories: string[];
  index: string;
  colors?: string[];
  height?: number | string;
  className?: string;
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
}

export const defaultColors = [
  '#7E69AB', // Primary purple
  '#0EA5E9', // Info blue
  '#9b87f5', // Light purple
  '#32D583', // Success green
  '#FFA500', // Warning orange
  '#F97066', // Error red
  '#8E9196', // Gray
];

export const getDefaultValueFormatter = (value: number): string => {
  return value.toString();
};

export const chartClasses = {
  base: "w-full font-sans",
  axisLabel: "text-xs fill-muted-foreground",
  tooltip: "rounded-lg border bg-background p-2 shadow-md",
};

export const combineChartStyles = (...styles: ClassValue[]) => {
  return cn(...styles);
};
