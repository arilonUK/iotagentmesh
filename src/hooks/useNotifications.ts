
import { useState, useEffect, useCallback } from 'react';
import { notificationService, Notification, NotificationPreferences } from '@/services/notificationService';
import { useAuth } from '@/contexts/auth';

export function useNotifications() {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  
  const fetchNotifications = useCallback(async () => {
    if (!session?.user) return;
    
    setIsLoading(true);
    try {
      const data = await notificationService.fetchNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(notification => !notification.is_read).length);
    } catch (error) {
      console.error('Error in useNotifications hook:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user]);
  
  const fetchPreferences = useCallback(async () => {
    if (!session?.user) return;
    
    setPreferencesLoading(true);
    try {
      const prefs = await notificationService.fetchPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    } finally {
      setPreferencesLoading(false);
    }
  }, [session?.user]);
  
  const markAsRead = useCallback(async (notificationId: string) => {
    const success = await notificationService.markAsRead(notificationId);
    if (success) {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    return success;
  }, []);
  
  const markAllAsRead = useCallback(async () => {
    const success = await notificationService.markAllAsRead();
    if (success) {
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
    }
    return success;
  }, []);
  
  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    const success = await notificationService.updatePreferences(newPreferences);
    if (success && preferences) {
      setPreferences({ ...preferences, ...newPreferences });
    }
    return success;
  }, [preferences]);
  
  // Initial load
  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
      fetchPreferences();
    }
  }, [session?.user, fetchNotifications, fetchPreferences]);
  
  // Poll for new notifications every minute
  useEffect(() => {
    if (!session?.user) return;
    
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 60000); // 1 minute
    
    return () => clearInterval(intervalId);
  }, [session?.user, fetchNotifications]);
  
  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
    preferences,
    preferencesLoading,
    updatePreferences,
    fetchPreferences
  };
}
