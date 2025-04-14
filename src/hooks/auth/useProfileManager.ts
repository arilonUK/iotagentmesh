
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/contexts/auth/types';
import { profileServices } from '@/services/profileServices';

export type ProfileManagerReturn = {
  profile: Profile | null;
  fetchProfile: (userId: string) => Promise<void>;
};

export const useProfileManager = (): ProfileManagerReturn => {
  const [profile, setProfile] = useState<Profile | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data: userData } = await supabase.auth.getUser();
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }
      
      if (profileData) {
        console.log('Profile found:', profileData);
        setProfile(profileData);
        
        // Ensure the user has an organization, if not create one
        if (!profileData.default_organization_id && userData.user) {
          await profileServices.ensureUserHasOrganization(userId, userData.user.email || '');
          // Refetch the profile to get the updated organization ID
          fetchProfile(userId);
        }
      } else {
        console.log('No profile found for user, creating a new one');
        try {
          if (userData.user) {
            const email = userData.user.email || '';
            
            // Create a default organization first
            const orgId = await profileServices.ensureUserHasOrganization(userId, email);
            
            const newProfile = {
              id: userId,
              username: email,
              full_name: userData.user.user_metadata?.full_name || '',
              avatar_url: userData.user.user_metadata?.avatar_url || '',
              default_organization_id: orgId
            };
            
            const { data: insertedProfile, error: insertError } = await supabase
              .from('profiles')
              .insert(newProfile)
              .select()
              .single();
              
            if (insertError) {
              console.error('Error creating profile:', insertError);
            } else {
              console.log('New profile created:', insertedProfile);
              setProfile(insertedProfile);
            }
          }
        } catch (createError) {
          console.error('Error creating user profile:', createError);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  return {
    profile,
    fetchProfile,
  };
};
