
import { useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { organizationService } from '@/services/profile/organizationService';
import { UserOrganization, Profile, Organization } from './types';

const loadUserOrganizations = async (userId: string): Promise<UserOrganization[]> => {
  try {
    console.log('Loading user organizations for user:', userId);
    const organizations = await organizationService.getUserOrganizations(userId);
    console.log('Loaded organizations:', organizations);
    return organizations;
  } catch (error) {
    console.error('Failed to load user organizations:', error);
    return [];
  }
};

interface UseAuthListenerProps {
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setUserOrganizations: (orgs: UserOrganization[]) => void;
  setCurrentOrganization: (org: UserOrganization | null) => void;
  setOrganization: (org: Organization | null) => void;
  setProfile: (profile: Profile | null) => void;
}

export const useAuthListener = ({
  setSession,
  setUser,
  setIsAuthenticated,
  setLoading,
  setUserOrganizations,
  setCurrentOrganization,
  setOrganization,
  setProfile,
}: UseAuthListenerProps) => {
  const handleAuthStateChange = useCallback(async (
    event: string,
    session: Session | null
  ) => {
    console.log('Auth state change:', event, session?.user?.id);
    
    setSession(session);
    setUser(session?.user || null);
    setIsAuthenticated(!!session?.user);
    
    if (session?.user) {
      console.log('User signed in, updating state');
      
      // Load organizations for authenticated user
      const organizations = await loadUserOrganizations(session.user.id);
      setUserOrganizations(organizations);
      
      // Set current organization (prefer the one marked as default, or first one)
      const defaultOrg = organizations.find(org => org.is_default) || organizations[0] || null;
      if (defaultOrg) {
        console.log('Setting default organization:', defaultOrg);
        setCurrentOrganization(defaultOrg);
        setOrganization({
          id: defaultOrg.id,
          name: defaultOrg.name,
          slug: defaultOrg.slug
        });
      }
    } else {
      console.log('User signed out, clearing state');
      setUserOrganizations([]);
      setCurrentOrganization(null);
      setOrganization(null);
      setProfile(null);
    }
    
    setLoading(false);
  }, [setSession, setUser, setIsAuthenticated, setLoading, setUserOrganizations, setCurrentOrganization, setOrganization, setProfile]);

  const loadInitialSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await (await import('@/integrations/supabase/client')).supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }

      if (session?.user) {
        console.log('Existing session found, loading organizations immediately');
        
        setSession(session);
        setUser(session.user);
        setIsAuthenticated(true);
        
        // Load organizations immediately for existing session
        const organizations = await loadUserOrganizations(session.user.id);
        setUserOrganizations(organizations);
        
        // Set current organization
        const defaultOrg = organizations.find(org => org.is_default) || organizations[0] || null;
        if (defaultOrg) {
          console.log('Setting default organization:', defaultOrg);
          setCurrentOrganization(defaultOrg);
          setOrganization({
            id: defaultOrg.id,
            name: defaultOrg.name,
            slug: defaultOrg.slug
          });
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error in loadInitialSession:', error);
      setLoading(false);
    }
  }, [setSession, setUser, setIsAuthenticated, setLoading, setUserOrganizations, setCurrentOrganization, setOrganization]);

  useEffect(() => {
    let mounted = true;

    const setupAuth = async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
      
      // Load initial session
      if (mounted) {
        await loadInitialSession();
      }

      return () => {
        subscription.unsubscribe();
      };
    };

    setupAuth();

    return () => {
      mounted = false;
    };
  }, [handleAuthStateChange, loadInitialSession]);
};
