
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AlarmEvent } from '@/types/alarm';

export function useDeviceAlarms(deviceId: string) {
  const [alarmEvents, setAlarmEvents] = useState<AlarmEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlarmEvents = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Step 1: Get the alarm events for the device without any joins
        // This avoids potential recursion in RLS policies
        const { data: eventsData, error: eventsError } = await supabase
          .from('alarm_events')
          .select('id, alarm_id, device_id, status, triggered_at, acknowledged_at, resolved_at, acknowledged_by, trigger_value, message')
          .eq('device_id', deviceId)
          .order('triggered_at', { ascending: false });

        if (eventsError) throw eventsError;
        
        if (!eventsData || eventsData.length === 0) {
          setAlarmEvents([]);
          setIsLoading(false);
          return;
        }
        
        // Step 2: Get the alarm details separately
        const alarmIds = eventsData.map(event => event.alarm_id);
        const { data: alarmsData, error: alarmsError } = await supabase
          .from('alarms')
          .select('id, name, description, severity')
          .in('id', alarmIds);
          
        if (alarmsError) throw alarmsError;
        
        // Step 3: Get the device details separately
        const { data: deviceData, error: deviceError } = await supabase
          .from('devices')
          .select('id, name, type')
          .eq('id', deviceId)
          .single();
          
        if (deviceError && deviceError.code !== 'PGRST116') throw deviceError;
        
        // Step 4: Combine the data
        const combinedData = eventsData.map(event => {
          const alarm = alarmsData?.find(a => a.id === event.alarm_id);
          return {
            ...event,
            alarm: alarm ? {
              name: alarm.name,
              description: alarm.description,
              severity: alarm.severity
            } : undefined,
            device: deviceData ? {
              name: deviceData.name,
              type: deviceData.type
            } : undefined
          };
        });
        
        setAlarmEvents(combinedData);
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
      // First get the current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      const userId = userData?.user?.id || null;
      
      // Then update the alarm event
      const { error } = await supabase
        .from('alarm_events')
        .update({ 
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: userId
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

  return { alarmEvents, isLoading, error, acknowledgeAlarm, resolveAlarm };
}
