
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { RefreshCw, Activity } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { LineChart } from '@/components/ui/charts';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Device } from '@/types/device';

interface DeviceRealTimeMonitorProps {
  device: Device;
  onRefresh?: () => void;
  className?: string;
}

// Mock data generation for real-time charts
const generateMockData = (dataPoints = 20) => {
  const now = new Date();
  const data = [];
  
  for (let i = dataPoints - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 30000); // 30 second intervals
    const formattedTime = timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit' 
    });
    
    // Generate somewhat realistic data with some variability
    const baseTemperature = 22 + Math.sin(i / 24 * Math.PI * 2) * 2;
    const randomVariation = (Math.random() - 0.5) * 1;
    
    data.push({
      name: formattedTime,
      temperature: parseFloat((baseTemperature + randomVariation).toFixed(1)),
      humidity: parseFloat((60 + Math.sin(i / 18 * Math.PI * 2) * 15 + randomVariation * 3).toFixed(1)),
      energy: parseFloat((220 + Math.sin(i / 30 * Math.PI * 2) * 40 + randomVariation * 10).toFixed(1))
    });
  }
  
  return data;
};

export function DeviceRealTimeMonitor({ 
  device, 
  onRefresh,
  className 
}: DeviceRealTimeMonitorProps) {
  const [selectedMetric, setSelectedMetric] = useState('temperature');
  const [realTimeData, setRealTimeData] = useState(generateMockData());
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Simulate real-time updates
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isLive) {
      interval = setInterval(() => {
        const newData = [...realTimeData];
        newData.shift(); // Remove oldest data point
        
        // Add new data point
        const now = new Date();
        const formattedTime = now.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit' 
        });
        
        // Generate new values with some continuity from the last point
        const lastPoint = newData[newData.length - 1];
        const randomVariation = (Math.random() - 0.5) * 0.6;
        
        newData.push({
          name: formattedTime,
          temperature: parseFloat((lastPoint.temperature + randomVariation).toFixed(1)),
          humidity: parseFloat((lastPoint.humidity + randomVariation * 3).toFixed(1)),
          energy: parseFloat((lastPoint.energy + randomVariation * 10).toFixed(1))
        });
        
        setRealTimeData(newData);
      }, 5000); // Update every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive, realTimeData]);
  
  const handleRefresh = () => {
    setIsLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setRealTimeData(generateMockData());
      setIsLoading(false);
      if (onRefresh) onRefresh();
    }, 1000);
  };
  
  const getValueFormatter = (metric: string) => {
    switch (metric) {
      case 'temperature':
        return (value: number) => `${value}°C`;
      case 'humidity':
        return (value: number) => `${value}%`;
      case 'energy':
        return (value: number) => `${value}W`;
      default:
        return (value: number) => `${value}`;
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Real-Time Monitoring</CardTitle>
          <CardDescription>
            Live device metrics and readings
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Badge 
            variant={isLive ? "default" : "outline"}
            className={`cursor-pointer ${isLive ? 'bg-green-500 hover:bg-green-600' : ''}`}
            onClick={() => setIsLive(!isLive)}
          >
            <Activity className="h-3 w-3 mr-1" />
            {isLive ? 'LIVE' : 'PAUSED'}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select 
            value={selectedMetric} 
            onValueChange={setSelectedMetric}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="temperature">Temperature</SelectItem>
              <SelectItem value="humidity">Humidity</SelectItem>
              <SelectItem value="energy">Energy Usage</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="h-[300px] w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <LineChart
              data={realTimeData}
              index="name"
              categories={[selectedMetric]}
              colors={[selectedMetric === 'temperature' ? '#7E69AB' : 
                      selectedMetric === 'humidity' ? '#0EA5E9' : '#9b87f5']}
              valueFormatter={getValueFormatter(selectedMetric)}
              showLegend={false}
              className="h-full"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
