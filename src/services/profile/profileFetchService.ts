
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/contexts/auth/types';

export const profileFetchService = {
  getProfile: async (userId: string): Promise<Profile | null> => {
    try {
      if (!userId) {
        console.error('No user ID provided to getProfile');
        return null;
      }

      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      if (!data) {
        console.log('No profile found for user:', userId);
        return null;
      }
      
      console.log('Profile fetched successfully');
      return data as Profile;
    } catch (error) {
      console.error('Exception fetching profile:', error);
      return null;
    }
  }
};
