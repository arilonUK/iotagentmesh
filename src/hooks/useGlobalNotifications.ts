
import { useNotificationContext } from '@/contexts/notification/NotificationContext';

export const useGlobalNotifications = () => {
  const {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  } = useNotificationContext();

  return {
    // Toast shortcuts
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
    
    // Persistent notifications
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  };
};
