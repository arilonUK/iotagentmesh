
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';
import { profileServices } from './profileServices';

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
      } else {
        console.log('No profile found for user, creating a new one');
        // Create a default profile for the user
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            // Create a default organization for the user if they don't have one
            const { data: newOrg, error: orgError } = await supabase
              .from('organizations')
              .insert({
                name: `${userData.user.email?.split('@')[0]}'s Organization`,
                slug: `org-${Math.random().toString(36).substring(2, 10)}`
              })
              .select()
              .single();
              
            if (orgError) {
              console.error('Error creating organization:', orgError);
              // Continue with profile creation without an organization
            }
            
            const newProfile = {
              id: userId,
              username: userData.user.email,
              full_name: userData.user.user_metadata?.full_name || '',
              avatar_url: userData.user.user_metadata?.avatar_url || '',
              default_organization_id: newOrg?.id || null
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
              
              // If we created an organization, add the user as an owner
              if (newOrg) {
                const { error: memberError } = await supabase
                  .from('organization_members')
                  .insert({
                    organization_id: newOrg.id,
                    user_id: userId,
                    role: 'owner'
                  });
                  
                if (memberError) {
                  console.error('Error adding user to organization:', memberError);
                } else {
                  console.log('User added as owner to new organization:', newOrg.id);
                }
              }
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
