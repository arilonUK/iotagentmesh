import React, { createContext, useContext, useCallback } from 'react';
import { useAuth } from './auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface NotificationContextType {
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  isLoading: boolean;
  markingAsRead: boolean;
  deletingNotification: boolean;
  markingAllAsRead: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  isLoading: false,
  markingAsRead: false,
  deletingNotification: false,
  markingAllAsRead: false,
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!session?.user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase.rpc('mark_notification_as_read', {
        p_notification_id: notificationId,
        p_user_id: session.user.id
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    },
  });
  
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase.rpc('mark_all_notifications_as_read', {
        p_user_id: session.user.id
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    },
    onError: (error) => {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    },
  });
  
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!session?.user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', session.user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: 'Success',
        description: 'Notification deleted',
      });
    },
    onError: (error) => {
      console.error('Error deleting notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      });
    },
  });

  const markAsRead = useCallback(async (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  }, [markAsReadMutation]);

  const markAllAsRead = useCallback(async () => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    deleteNotificationMutation.mutate(notificationId);
  }, [deleteNotificationMutation]);

  const value = {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isLoading: false,
    markingAsRead: markAsReadMutation.isPending,
    deletingNotification: deleteNotificationMutation.isPending,
    markingAllAsRead: markAllAsReadMutation.isPending
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
