
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, BarChart, AreaChart, GaugeChart, ScatterChart } from '@/components/ui/charts';
import { MultiSeriesChart } from '@/components/ui/charts';
import { ChartRenderer } from './ChartRenderer';
import { ChartTypeSelector, ChartType } from './ChartTypeSelector';
import { DataExportMenu } from '@/components/exports/DataExportMenu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Device } from '@/types/device';
import { ChartData, ComparisonData, TimeframeOption, ExportData } from '@/types/dashboard';

interface CustomizableDashboardProps {
  device: Device;
  temperatureData: ChartData[];
  humidityData: ChartData[];
  energyData: ChartData[];
  timeframe: TimeframeOption;
  onTimeframeChange: (timeframe: TimeframeOption) => void;
}

export function CustomizableDashboard({
  device,
  temperatureData,
  humidityData,
  energyData,
  timeframe,
  onTimeframeChange
}: CustomizableDashboardProps) {
  const [chartType, setChartType] = useState<ChartType>('line');
  const [activeTab, setActiveTab] = useState<string>('temperature');
  
  // Prepare comparison data (combining temperature and humidity)
  const comparisonData: ComparisonData[] = temperatureData.map((temp, index) => {
    const humidity = humidityData[index] || { name: '', value: 0 };
    return {
      name: temp.name,
      temperature: temp.value,
      humidity: humidity.value
    };
  });
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Data Dashboard for {device.name}</CardTitle>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={(value: TimeframeOption) => onTimeframeChange(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hour">Last Hour</SelectItem>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
            </SelectContent>
          </Select>
          
          <DataExportMenu 
            data={(() => {
              switch (activeTab) {
                case 'temperature': return temperatureData as unknown as Record<string, unknown>[];
                case 'humidity': return humidityData as unknown as Record<string, unknown>[];
                case 'energy': return energyData as unknown as Record<string, unknown>[];
                case 'comparison': return comparisonData as unknown as Record<string, unknown>[];
                default: return temperatureData as unknown as Record<string, unknown>[];
              }
            })()}
            fileName={`${device.name}-${activeTab}-data`}
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="temperature">Temperature</TabsTrigger>
              <TabsTrigger value="humidity">Humidity</TabsTrigger>
              <TabsTrigger value="energy">Energy Usage</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            </TabsList>
            
            {activeTab !== 'comparison' && (
              <ChartTypeSelector value={chartType} onValueChange={setChartType} />
            )}
          </div>
          
          <TabsContent value="temperature" className="h-[300px]">
            <ChartRenderer
              chartType={chartType}
              data={temperatureData}
              categories={['value']}
              index="name"
              valueFormatter={(value) => `${value}°C`}
            />
          </TabsContent>
          
          <TabsContent value="humidity" className="h-[300px]">
            <ChartRenderer
              chartType={chartType}
              data={humidityData}
              categories={['value']}
              index="name"
              valueFormatter={(value) => `${value}%`}
            />
          </TabsContent>
          
          <TabsContent value="energy" className="h-[300px]">
            <ChartRenderer
              chartType={chartType}
              data={energyData}
              categories={['value']}
              index="name"
              valueFormatter={(value) => `${value}W`}
            />
          </TabsContent>
          
          <TabsContent value="comparison" className="h-[300px]">
            <MultiSeriesChart
              data={comparisonData as unknown as Record<string, unknown>[]}
              index="name"
              series={[
                { dataKey: 'temperature', type: 'line', color: '#7E69AB', yAxisId: 'left' },
                { dataKey: 'humidity', type: 'area', color: '#0EA5E9', yAxisId: 'right' }
              ]}
              dualYAxis
              leftAxisValueFormatter={(value) => `${value}°C`}
              rightAxisValueFormatter={(value) => `${value}%`}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
