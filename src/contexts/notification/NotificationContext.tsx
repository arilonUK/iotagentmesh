
import React, { createContext, useContext, useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface NotificationConfig {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
  action?: React.ReactNode;
}

export interface GlobalNotification extends NotificationConfig {
  id: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  // Toast notifications (temporary)
  showNotification: (config: NotificationConfig) => void;
  showSuccess: (title: string, description?: string) => void;
  showError: (title: string, description?: string) => void;
  showWarning: (title: string, description?: string) => void;
  showInfo: (title: string, description?: string) => void;
  
  // Persistent notifications
  notifications: GlobalNotification[];
  unreadCount: number;
  addNotification: (config: NotificationConfig) => string;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<GlobalNotification[]>([]);

  const showNotification = useCallback((config: NotificationConfig) => {
    toast(config);
  }, [toast]);

  const showSuccess = useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default',
    });
  }, [toast]);

  const showError = useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'destructive',
    });
  }, [toast]);

  const showWarning = useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'destructive',
    });
  }, [toast]);

  const showInfo = useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default',
    });
  }, [toast]);

  const addNotification = useCallback((config: NotificationConfig): string => {
    const id = crypto.randomUUID();
    const notification: GlobalNotification = {
      ...config,
      id,
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications(prev => [notification, ...prev]);
    
    // Also show as toast
    showNotification(config);
    
    return id;
  }, [showNotification]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: NotificationContextType = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
