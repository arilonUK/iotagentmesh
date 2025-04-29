
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, BarChart, AreaChart, GaugeChart } from '@/components/ui/charts';

interface DeviceStatsProps {
  deviceId: string;
}

const mockChartData = {
  temperature: [
    { name: '12:00', value: 22 },
    { name: '13:00', value: 23 },
    { name: '14:00', value: 25 },
    { name: '15:00', value: 24 },
    { name: '16:00', value: 22 },
    { name: '17:00', value: 21 },
  ],
  humidity: [
    { name: '12:00', value: 65 },
    { name: '13:00', value: 60 },
    { name: '14:00', value: 58 },
    { name: '15:00', value: 62 },
    { name: '16:00', value: 67 },
    { name: '17:00', value: 70 },
  ],
  energy: [
    { name: 'Mon', value: 230 },
    { name: 'Tue', value: 245 },
    { name: 'Wed', value: 235 },
    { name: 'Thu', value: 260 },
    { name: 'Fri', value: 280 },
    { name: 'Sat', value: 210 },
    { name: 'Sun', value: 190 },
  ],
  gauge: {
    temperature: 24,
    humidity: 65,
    battery: 82,
  }
};

const DeviceStats: React.FC<DeviceStatsProps> = ({ deviceId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="temperature">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="temperature">Temperature</TabsTrigger>
            <TabsTrigger value="humidity">Humidity</TabsTrigger>
            <TabsTrigger value="energy">Energy Usage</TabsTrigger>
            <TabsTrigger value="gauges">Status</TabsTrigger>
          </TabsList>
          <TabsContent value="temperature">
            <div className="h-[300px]">
              <LineChart 
                data={mockChartData.temperature}
                categories={['value']}
                index="name"
                colors={['#7E69AB']}
                valueFormatter={(value) => `${value}°C`}
                curved
                showLegend={false}
              />
            </div>
          </TabsContent>
          <TabsContent value="humidity">
            <div className="h-[300px]">
              <AreaChart 
                data={mockChartData.humidity}
                categories={['value']}
                index="name"
                colors={['#0EA5E9']}
                valueFormatter={(value) => `${value}%`}
                showLegend={false}
              />
            </div>
          </TabsContent>
          <TabsContent value="energy">
            <div className="h-[300px]">
              <BarChart 
                data={mockChartData.energy}
                categories={['value']}
                index="name"
                colors={['#9b87f5']}
                valueFormatter={(value) => `${value}W`}
                showLegend={false}
              />
            </div>
          </TabsContent>
          <TabsContent value="gauges">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <GaugeChart
                  value={mockChartData.gauge.temperature}
                  min={0}
                  max={50}
                  valueFormatter={(value) => `${value}°C`}
                  label="Temperature"
                  colors={['#32D583', '#FFA500', '#F97066']}
                />
              </div>
              <div>
                <GaugeChart
                  value={mockChartData.gauge.humidity}
                  valueFormatter={(value) => `${value}%`}
                  label="Humidity"
                  colors={['#F97066', '#FFA500', '#0EA5E9']}
                />
              </div>
              <div>
                <GaugeChart
                  value={mockChartData.gauge.battery}
                  valueFormatter={(value) => `${value}%`}
                  label="Battery"
                  colors={['#F97066', '#FFA500', '#32D583']}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DeviceStats;
