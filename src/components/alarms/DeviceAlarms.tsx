
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AlarmEvent } from '@/types/alarm';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertTriangle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DeviceAlarmsProps {
  deviceId: string;
}

export default function DeviceAlarms({ deviceId }: DeviceAlarmsProps) {
  const [alarmEvents, setAlarmEvents] = useState<AlarmEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchAlarmEvents = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('alarm_events')
          .select(`
            *,
            alarm:alarm_id (
              name,
              description,
              severity
            ),
            device:device_id (
              name,
              type
            )
          `)
          .eq('device_id', deviceId)
          .order('triggered_at', { ascending: false });

        if (error) throw error;
        setAlarmEvents(data || []);
      } catch (err: any) {
        console.error('Error fetching alarm events:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlarmEvents();
  }, [deviceId]);

  const acknowledgeAlarm = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('alarm_events')
        .update({ 
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', eventId);

      if (error) throw error;

      setAlarmEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, status: 'acknowledged', acknowledged_at: new Date().toISOString() } 
          : event
      ));
    } catch (err: any) {
      console.error('Error acknowledging alarm:', err);
    }
  };

  const resolveAlarm = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('alarm_events')
        .update({ 
          status: 'resolved',
          resolved_at: new Date().toISOString()
        })
        .eq('id', eventId);

      if (error) throw error;

      setAlarmEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, status: 'resolved', resolved_at: new Date().toISOString() } 
          : event
      ));
    } catch (err: any) {
      console.error('Error resolving alarm:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="destructive">Active</Badge>;
      case 'acknowledged':
        return <Badge variant="default">Acknowledged</Badge>;
      case 'resolved':
        return <Badge variant="secondary">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="text-red-500" />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" />;
      case 'info':
        return <Clock className="text-blue-500" />;
      default:
        return <AlertCircle />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Device Alarms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Device Alarms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 p-4 rounded-md text-red-800">
            Error loading alarm data: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alarmEvents.length === 0) {
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

  // Display only active or recent events when not showing all
  const displayEvents = showAll 
    ? alarmEvents 
    : alarmEvents.filter(e => e.status === 'active' || new Date(e.triggered_at) > new Date(Date.now() - 24 * 60 * 60 * 1000));

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
                    {getSeverityIcon(event.alarm?.severity || 'info')}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="font-medium">{event.alarm?.name}</div>
                    <div className="text-sm text-muted-foreground">{event.message}</div>
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(event.triggered_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>{getStatusBadge(event.status)}</TableCell>
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
