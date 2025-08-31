
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AlarmEvent, AlarmStatus, AlarmSeverity } from '@/types/alarm';

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
    console.log('useDeviceAlarms: Starting with deviceId:', deviceId);
    
    // Validate device ID
    if (!deviceId || !isValidUUID(deviceId)) {
      console.error('useDeviceAlarms: Invalid device ID format:', deviceId);
      setError('Invalid device ID format');
      setIsLoading(false);
      return;
    }
    
    const fetchAlarmEvents = async () => {
      console.log('useDeviceAlarms: Setting loading to true');
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('useDeviceAlarms: Calling RPC function for device:', deviceId);
        
        // Use bypass function to get alarm events to avoid RLS recursion
        const { data: eventsData, error: eventsError } = await supabase
          .rpc('get_device_alarm_events_bypass_rls', {
            p_device_id: deviceId
          });

        console.log('useDeviceAlarms: RPC response:', { eventsData, eventsError });

        if (eventsError) {
          console.error('useDeviceAlarms: RPC error:', eventsError);
          throw eventsError;
        }
        
        if (!eventsData || !Array.isArray(eventsData) || eventsData.length === 0) {
          console.log('useDeviceAlarms: No alarm events found for device:', deviceId);
          setAlarmEvents([]);
          setIsLoading(false);
          return;
        }
        
        console.log(`useDeviceAlarms: Found ${eventsData.length} alarm events for device ${deviceId}`);
        
        // The bypass function returns structured data
        const formattedEvents: AlarmEvent[] = eventsData.map((event: Record<string, unknown>) => ({
          id: event.id as string,
          alarm_id: event.alarm_id as string,
          device_id: event.device_id as string,
          status: event.status as AlarmStatus,
          triggered_at: event.triggered_at as string,
          acknowledged_at: event.acknowledged_at as string | null,
          resolved_at: event.resolved_at as string | null,
          acknowledged_by: event.acknowledged_by as string | null,
          trigger_value: event.trigger_value as number | null,
          message: event.message as string,
          alarm: event.alarm_name ? {
            name: event.alarm_name as string,
            description: event.alarm_description as string,
            severity: event.alarm_severity as AlarmSeverity
          } : undefined,
          device: event.device_name ? {
            name: event.device_name as string,
            type: event.device_type as string
          } : undefined
        }));
        
        console.log('useDeviceAlarms: Formatted events:', formattedEvents);
        setAlarmEvents(formattedEvents);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch alarm events';
        console.error('useDeviceAlarms: Error fetching alarm events:', err);
        setError(errorMessage);
      } finally {
        console.log('useDeviceAlarms: Setting loading to false');
        setIsLoading(false);
      }
    };

    fetchAlarmEvents();
  }, [deviceId]);

  const acknowledgeAlarm = async (eventId: string) => {
    if (!isValidUUID(eventId)) {
      console.error('useDeviceAlarms: Invalid alarm event ID format:', eventId);
      return;
    }
    
    try {
      console.log('useDeviceAlarms: Acknowledging alarm event:', eventId);
      
      // Use bypass function to update alarm event
      const { error } = await supabase
        .rpc('acknowledge_alarm_event_bypass_rls', {
          p_event_id: eventId
        });
        
      if (error) {
        console.error('useDeviceAlarms: Error acknowledging alarm:', error);
        throw error;
      }

      console.log('useDeviceAlarms: Successfully acknowledged alarm:', eventId);
      setAlarmEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, status: 'acknowledged', acknowledged_at: new Date().toISOString() } 
          : event
      ));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to acknowledge alarm';
      console.error('useDeviceAlarms: Error acknowledging alarm:', err);
      setError(errorMessage);
    }
  };

  const resolveAlarm = async (eventId: string) => {
    if (!isValidUUID(eventId)) {
      console.error('useDeviceAlarms: Invalid alarm event ID format:', eventId);
      return;
    }
    
    try {
      console.log('useDeviceAlarms: Resolving alarm event:', eventId);
      
      // Use bypass function to resolve alarm event
      const { error } = await supabase
        .rpc('resolve_alarm_event_bypass_rls', {
          p_event_id: eventId
        });
        
      if (error) {
        console.error('useDeviceAlarms: Error resolving alarm:', error);
        throw error;
      }

      console.log('useDeviceAlarms: Successfully resolved alarm:', eventId);
      setAlarmEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, status: 'resolved', resolved_at: new Date().toISOString() } 
          : event
      ));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resolve alarm';
      console.error('useDeviceAlarms: Error resolving alarm:', err);
      setError(errorMessage);
    }
  };

  console.log('useDeviceAlarms: Returning state:', { 
    alarmEventsCount: alarmEvents.length, 
    isLoading, 
    error 
  });

  return { alarmEvents, isLoading, error, acknowledgeAlarm, resolveAlarm };
}
