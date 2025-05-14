
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity, Info, AlertTriangle, CheckCircle } from 'lucide-react';

interface ActivityEvent {
  id: string;
  timestamp: string;
  type: 'connection' | 'status' | 'reading' | 'alarm';
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
}

interface DeviceActivityTimelineProps {
  deviceId: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

// Mock data function - in a real app, this would fetch from your API
const getMockActivityEvents = (deviceId: string): ActivityEvent[] => {
  const now = new Date();
  return [
    {
      id: '1',
      timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
      type: 'reading',
      message: 'Temperature reading: 24.5°C',
      severity: 'info'
    },
    {
      id: '2',
      timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
      type: 'status',
      message: 'Device status changed to online',
      severity: 'success'
    },
    {
      id: '3',
      timestamp: new Date(now.getTime() - 30 * 60000).toISOString(),
      type: 'alarm',
      message: 'High temperature warning threshold exceeded',
      severity: 'warning'
    },
    {
      id: '4',
      timestamp: new Date(now.getTime() - 60 * 60000).toISOString(),
      type: 'connection',
      message: 'Device disconnected',
      severity: 'critical'
    },
    {
      id: '5',
      timestamp: new Date(now.getTime() - 90 * 60000).toISOString(),
      type: 'reading',
      message: 'Humidity reading: 65%',
      severity: 'info'
    }
  ];
};

export function DeviceActivityTimeline({ 
  deviceId, 
  onRefresh,
  isLoading = false
}: DeviceActivityTimelineProps) {
  const activities = getMockActivityEvents(deviceId);
  
  const getEventIcon = (severity: string) => {
    switch (severity) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <Activity className="h-4 w-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };
  
  const getEventLabel = (type: string) => {
    switch (type) {
      case 'connection':
        return <Badge variant="outline">Connection</Badge>;
      case 'status':
        return <Badge variant="outline">Status</Badge>;
      case 'reading':
        return <Badge variant="outline">Reading</Badge>;
      case 'alarm':
        return <Badge variant="outline">Alarm</Badge>;
      default:
        return <Badge variant="outline">Event</Badge>;
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Recent device events and activities</CardDescription>
        </div>
        {onRefresh && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No activity recorded yet</p>
          </div>
        ) : (
          <div className="relative pl-6 border-l space-y-6 my-4">
            {activities.map((activity) => (
              <div key={activity.id} className="relative">
                <div className="absolute -left-10 mt-1">
                  {getEventIcon(activity.severity)}
                </div>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{activity.message}</span>
                    {getEventLabel(activity.type)}
                  </div>
                  <time className="text-xs text-muted-foreground">
                    {formatTimestamp(activity.timestamp)}
                  </time>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
