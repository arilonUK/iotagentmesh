
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';
import { profileServices } from '@/services/profileServices';
import { Database } from '@/integrations/supabase/types';

export type SessionManagerReturn = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  fetchProfile: (userId: string) => Promise<void>;
};

export const useSessionManager = (): SessionManagerReturn => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          setProfile(null);
        } else if (event === 'SIGNED_IN' && newSession?.user) {
          // Use setTimeout to prevent supabase deadlock
          setTimeout(() => {
            fetchProfile(newSession.user.id);
          }, 0);
        }
      }
    );
    
    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data: userData } = await supabase.auth.getUser();
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to handle no rows case

      if (profileError && profileError.code !== 'PGRST116') {
        // Log other errors but not the "no rows returned" error
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
        // Create a default profile for the user
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
    session,
    user,
    profile,
    loading,
    fetchProfile,
  };
};
