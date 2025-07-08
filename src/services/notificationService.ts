
import { supabase } from '@/integrations/supabase/client';

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
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      
      if (!userId) return null;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      
      // If no preferences exist, return default preferences
      if (!data) {
        return {
          notify_device_alerts: true,
          notify_system_events: true,
          notify_new_devices: true,
          email_notifications: false
        };
      }
      
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
      
      console.log('Updating notification preferences for user:', userId, preferences);
      
      // First, try to update existing preferences
      const { data: updateData, error: updateError } = await supabase
        .from('notification_preferences')
        .update(preferences)
        .eq('user_id', userId)
        .select();
      
      // If no rows were updated (preferences don't exist), create them
      if (!updateError && (!updateData || updateData.length === 0)) {
        console.log('No existing preferences found, creating new ones');
        const { error: insertError } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: userId,
            notify_device_alerts: preferences.notify_device_alerts ?? true,
            notify_system_events: preferences.notify_system_events ?? true,
            notify_new_devices: preferences.notify_new_devices ?? true,
            email_notifications: preferences.email_notifications ?? false
          });
          
        if (insertError) {
          console.error('Error inserting notification preferences:', insertError);
          return false;
        }
      } else if (updateError) {
        console.error('Error updating notification preferences:', updateError);
        return false;
      }
      
      console.log('Notification preferences updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }
};
