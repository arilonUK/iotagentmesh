
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AlarmEvent } from '@/types/alarm';

/**
 * Validates a UUID string
 * @param uuid String to validate as UUID
 * @returns boolean indicating if the string is a valid UUID
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function useDeviceAlarms(deviceId: string) {
  const [alarmEvents, setAlarmEvents] = useState<AlarmEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Validate device ID
    if (!deviceId || !isValidUUID(deviceId)) {
      setError('Invalid device ID format');
      setIsLoading(false);
      return;
    }
    
    const fetchAlarmEvents = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching alarm events for device:', deviceId);
        
        // Use bypass function to get alarm events to avoid RLS recursion
        const { data: eventsData, error: eventsError } = await supabase
          .rpc('get_device_alarm_events_bypass_rls', {
            p_device_id: deviceId
          });

        if (eventsError) {
          console.error('Error fetching alarm events:', eventsError);
          throw eventsError;
        }
        
        if (!eventsData || eventsData.length === 0) {
          console.log('No alarm events found for device:', deviceId);
          setAlarmEvents([]);
          setIsLoading(false);
          return;
        }
        
        console.log(`Found ${eventsData.length} alarm events for device ${deviceId}`);
        
        // The bypass function should return all the data we need
        const formattedEvents = eventsData.map(event => ({
          id: event.id,
          alarm_id: event.alarm_id,
          device_id: event.device_id,
          status: event.status,
          triggered_at: event.triggered_at,
          acknowledged_at: event.acknowledged_at,
          resolved_at: event.resolved_at,
          acknowledged_by: event.acknowledged_by,
          trigger_value: event.trigger_value,
          message: event.message,
          alarm: event.alarm_name ? {
            name: event.alarm_name,
            description: event.alarm_description,
            severity: event.alarm_severity
          } : undefined,
          device: event.device_name ? {
            name: event.device_name,
            type: event.device_type
          } : undefined
        }));
        
        setAlarmEvents(formattedEvents);
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
    if (!isValidUUID(eventId)) {
      console.error('Invalid alarm event ID format:', eventId);
      return;
    }
    
    try {
      // Use bypass function to update alarm event
      const { error } = await supabase
        .rpc('acknowledge_alarm_event_bypass_rls', {
          p_event_id: eventId
        });
        
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
    if (!isValidUUID(eventId)) {
      console.error('Invalid alarm event ID format:', eventId);
      return;
    }
    
    try {
      // Use bypass function to resolve alarm event
      const { error } = await supabase
        .rpc('resolve_alarm_event_bypass_rls', {
          p_event_id: eventId
        });
        
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
