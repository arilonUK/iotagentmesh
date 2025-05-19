
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Profile } from '@/contexts/auth/types';

export const profileUpdateService = {
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
      
      // Return the updated profile with the new data
      return { ...profileData, id: user.id } as Profile;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
};
