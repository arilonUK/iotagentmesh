import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_read: boolean;
  created_at: string;
  related_entity_type?: string;
  related_entity_id?: string;
}

export interface NotificationPreferences {
  notify_device_alerts: boolean;
  notify_system_events: boolean;
  notify_new_devices: boolean;
  email_notifications: boolean;
}

export const notificationService = {
  async fetchNotifications(): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Type cast the response to match our interface
      return (data || []).map(item => ({
        ...item,
        type: item.type as 'info' | 'warning' | 'error' | 'success',
        priority: item.priority as 'low' | 'normal' | 'high' | 'urgent'
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      
      if (!userId) return false;
      
      const { data, error } = await supabase
        .rpc('mark_notification_as_read', { 
          p_notification_id: notificationId,
          p_user_id: userId
        });
      
      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },

  async markAllAsRead(): Promise<boolean> {
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      
      if (!userId) return false;
      
      const { data, error } = await supabase
        .rpc('mark_all_notifications_as_read', { 
          p_user_id: userId 
        });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  },

  async fetchPreferences(): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }
  },

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<boolean> {
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      
      if (!userId) return false;
      
      const { error } = await supabase
        .from('notification_preferences')
        .update(preferences)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      console.log("Notification preferences updated");
      
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }
};
