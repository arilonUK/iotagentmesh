
import { useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { organizationService } from '@/services/profile/organizationService';
import { UserOrganization } from './types';

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

export const useAuthListener = () => {
  const handleAuthStateChange = useCallback(async (
    event: string,
    session: Session | null,
    setSession: (session: Session | null) => void,
    setUser: (user: User | null) => void,
    setUserOrganizations: (orgs: UserOrganization[]) => void,
    setCurrentOrganization: (org: UserOrganization | null) => void,
    setLoading: (loading: boolean) => void
  ) => {
    console.log('Auth state change:', event, session?.user?.id);
    
    setSession(session);
    setUser(session?.user || null);
    
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
      }
    } else {
      console.log('User signed out, clearing state');
      setUserOrganizations([]);
      setCurrentOrganization(null);
    }
    
    setLoading(false);
  }, []);

  const loadInitialSession = useCallback(async (
    setSession: (session: Session | null) => void,
    setUser: (user: User | null) => void,
    setUserOrganizations: (orgs: UserOrganization[]) => void,
    setCurrentOrganization: (org: UserOrganization | null) => void,
    setLoading: (loading: boolean) => void
  ) => {
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
        
        // Load organizations immediately for existing session
        const organizations = await loadUserOrganizations(session.user.id);
        setUserOrganizations(organizations);
        
        // Set current organization
        const defaultOrg = organizations.find(org => org.is_default) || organizations[0] || null;
        if (defaultOrg) {
          console.log('Setting default organization:', defaultOrg);
          setCurrentOrganization(defaultOrg);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error in loadInitialSession:', error);
      setLoading(false);
    }
  }, []);

  return {
    handleAuthStateChange,
    loadInitialSession
  };
};
