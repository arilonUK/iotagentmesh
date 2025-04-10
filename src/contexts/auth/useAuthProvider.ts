
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Profile, Organization, OrganizationMember, AuthContextType, UserOrganization } from './types';
import { authServices } from './authServices';
import { profileServices } from './profileServices';

export const useAuthProvider = (): AuthContextType => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userOrganizations, setUserOrganizations] = useState<UserOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setOrganization(null);
          setUserRole(null);
          setUserOrganizations([]);
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
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        setProfile(profileData);
        
        // Fetch user's organizations
        const orgs = await profileServices.getUserOrganizations(userId);
        setUserOrganizations(orgs);
        
        // Check if profileData has default_organization_id before trying to fetch org data
        if (profileData && profileData.default_organization_id) {
          await fetchOrganizationData(profileData.default_organization_id, userId);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchOrganizationData = async (orgId: string, userId: string) => {
    try {
      // Fetch organization details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single();

      if (orgError) {
        console.error('Error fetching organization:', orgError);
      } else {
        setOrganization(orgData as Organization);
      }

      // Fetch user's role in this organization
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .single();

      if (memberError) {
        console.error('Error fetching member role:', memberError);
      } else if (memberData) {
        setUserRole(memberData.role);
      }
    } catch (error) {
      console.error('Error fetching organization data:', error);
    }
  };

  const switchOrganization = async (organizationId: string): Promise<boolean> => {
    if (!user) {
      toast('You must be logged in to switch organizations', {
        style: { backgroundColor: 'red', color: 'white' }
      });
      return false;
    }

    const success = await profileServices.switchOrganization(user.id, organizationId);
    
    if (success) {
      // Refresh profile and organization data
      fetchProfile(user.id);
    }
    
    return success;
  };

  return {
    session,
    user,
    profile,
    organization,
    userRole,
    userOrganizations,
    loading,
    signUp: authServices.signUp,
    signIn: authServices.signIn,
    signOut: authServices.signOut,
    updateProfile: profileServices.updateProfile,
    switchOrganization
  };
};
