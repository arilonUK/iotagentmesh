export interface ChartData {
  name: string;
  value: number;
  timestamp?: string;
  [key: string]: string | number | undefined;
}

export interface ComparisonData {
  name: string;
  temperature: number;
  humidity: number;
}

export interface DashboardData {
  temperatureData: ChartData[];
  humidityData: ChartData[];
  energyData: ChartData[];
  multiData: ChartData[];
}

export type TimeframeOption = 'hour' | 'day' | 'week' | 'month';

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface EndpointTriggerData {
  [key: string]: unknown;
}

export type ExportData = ChartData[] | ComparisonData[];