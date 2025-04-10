
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Profile, UserOrganization } from './types';

export const profileServices = {
  updateProfile: async (profileData: Partial<Profile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (error) {
        toast('Error updating profile', { 
          style: { backgroundColor: 'red', color: 'white' } 
        });
        throw error;
      }

      toast('Profile updated successfully', {
        style: { backgroundColor: 'green', color: 'white' }
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  getUserOrganizations: async (userId: string): Promise<UserOrganization[]> => {
    try {
      // Use correct function call for RPC with parameters
      const { data, error } = await supabase
        .rpc('get_user_organizations', { p_user_id: userId });

      if (error) {
        console.error('Error fetching user organizations:', error);
        return [];
      }

      // Ensure data is cast to the correct type
      return data as UserOrganization[];
    } catch (error: any) {
      console.error('Error fetching user organizations:', error);
      return [];
    }
  },

  switchOrganization: async (userId: string, organizationId: string): Promise<boolean> => {
    try {
      // Use correct function call for RPC with parameters
      const { data, error } = await supabase
        .rpc('switch_user_organization', {
          p_user_id: userId,
          p_org_id: organizationId
        });

      if (error) {
        toast('Error switching organization', {
          style: { backgroundColor: 'red', color: 'white' }
        });
        throw error;
      }

      if (data) {
        toast('Organization switched successfully', {
          style: { backgroundColor: 'green', color: 'white' }
        });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error switching organization:', error);
      return false;
    }
  }
};
