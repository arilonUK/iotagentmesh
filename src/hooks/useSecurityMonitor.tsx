
import { useState, useEffect, useCallback } from 'react';
import { securityService } from '@/services/securityService';

interface SecurityEvent {
  type: 'failed_login' | 'suspicious_activity' | 'permission_denied' | 'data_access_violation';
  timestamp: Date;
  details: Record<string, any>;
}

/**
 * Hook for monitoring security events in the application
 */
export const useSecurityMonitor = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [alertCount, setAlertCount] = useState(0);

  const addSecurityEvent = useCallback((
    type: SecurityEvent['type'],
    details: Record<string, any>
  ) => {
    const event: SecurityEvent = {
      type,
      timestamp: new Date(),
      details
    };

    setEvents(prev => [event, ...prev.slice(0, 99)]); // Keep last 100 events
    setAlertCount(prev => prev + 1);

    // Log to security service
    securityService.logSecurityEvent(type, details);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlertCount(0);
  }, []);

  const getRecentEvents = useCallback((hours: number = 24) => {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return events.filter(event => event.timestamp > cutoff);
  }, [events]);

  const getEventsByType = useCallback((type: SecurityEvent['type']) => {
    return events.filter(event => event.type === type);
  }, [events]);

  // Monitor for suspicious patterns
  useEffect(() => {
    const recentFailedLogins = getEventsByType('failed_login').filter(
      event => event.timestamp > new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
    );

    if (recentFailedLogins.length >= 5) {
      addSecurityEvent('suspicious_activity', {
        reason: 'Multiple failed login attempts detected',
        count: recentFailedLogins.length
      });
    }
  }, [events, getEventsByType, addSecurityEvent]);

  return {
    events,
    alertCount,
    addSecurityEvent,
    clearAlerts,
    getRecentEvents,
    getEventsByType
  };
};
