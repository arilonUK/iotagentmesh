
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDeviceAlarms } from '@/hooks/useDeviceAlarms';
import { AlarmStatusBadge } from './AlarmStatusBadge';
import { AlarmSeverityIcon } from './AlarmSeverityIcon';

interface DeviceAlarmsProps {
  deviceId: string;
}

export default function DeviceAlarms({ deviceId }: DeviceAlarmsProps) {
  const [showAll, setShowAll] = useState(false);
  const { alarmEvents, isLoading, error, acknowledgeAlarm, resolveAlarm } = useDeviceAlarms(deviceId);

  console.log('DeviceAlarms: Rendering with state:', { 
    deviceId, 
    alarmEventsCount: alarmEvents.length, 
    isLoading, 
    error 
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Device Alarms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading alarm data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('DeviceAlarms: Displaying error:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Device Alarms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 p-4 rounded-md text-red-800">
            <p className="font-medium">Error loading alarm data</p>
            <p className="text-sm mt-1">{error}</p>
            <p className="text-xs mt-2 text-red-600">
              Device ID: {deviceId}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alarmEvents.length === 0) {
    console.log('DeviceAlarms: No alarm events found, showing empty state');
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Device Alarms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-muted-foreground">No alarms have been triggered for this device.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayEvents = showAll 
    ? alarmEvents 
    : alarmEvents.filter(e => e.status === 'active' || new Date(e.triggered_at) > new Date(Date.now() - 24 * 60 * 60 * 1000));

  console.log('DeviceAlarms: Displaying events:', { 
    totalEvents: alarmEvents.length, 
    displayedEvents: displayEvents.length, 
    showAll 
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Device Alarms</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? (
            <>Show Recent <ChevronUp className="ml-1 h-4 w-4" /></>
          ) : (
            <>Show All <ChevronDown className="ml-1 h-4 w-4" /></>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Triggered</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <AlarmSeverityIcon severity={event.alarm?.severity || 'info'} />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="font-medium">{event.alarm?.name || 'Unknown Alarm'}</div>
                    <div className="text-sm text-muted-foreground">{event.message}</div>
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(event.triggered_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <AlarmStatusBadge status={event.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {event.status === 'active' && (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => acknowledgeAlarm(event.id)}>
                          Acknowledge
                        </Button>
                        <Button size="sm" onClick={() => resolveAlarm(event.id)}>
                          Resolve
                        </Button>
                      </div>
                    )}
                    {event.status === 'acknowledged' && (
                      <Button size="sm" onClick={() => resolveAlarm(event.id)}>
                        Resolve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
