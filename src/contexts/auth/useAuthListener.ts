
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
      
      try {
        // Load organizations for authenticated user with timeout protection
        const organizations = await Promise.race([
          loadUserOrganizations(session.user.id),
          new Promise<UserOrganization[]>((resolve) => {
            setTimeout(() => {
              console.log('Organization loading timed out, proceeding with empty array');
              resolve([]);
            }, 5000); // 5 second timeout for auth flow
          })
        ]);
        
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
      } catch (error) {
        console.error('Error loading organizations during auth:', error);
        // Continue with empty organizations to not block auth flow
        setUserOrganizations([]);
        setCurrentOrganization(null);
        setOrganization(null);
      }
    } else {
      console.log('User signed out, clearing state');
      setUserOrganizations([]);
      setCurrentOrganization(null);
      setOrganization(null);
      setProfile(null);
    }
    
    // Always clear loading state regardless of organization loading success/failure
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
        
        try {
          // Load organizations immediately for existing session with timeout protection
          const organizations = await Promise.race([
            loadUserOrganizations(session.user.id),
            new Promise<UserOrganization[]>((resolve) => {
              setTimeout(() => {
                console.log('Initial organization loading timed out, proceeding with empty array');
                resolve([]);
              }, 5000); // 5 second timeout for initial load
            })
          ]);
          
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
        } catch (error) {
          console.error('Error loading organizations during initial session:', error);
          // Continue with empty organizations to not block auth flow
          setUserOrganizations([]);
          setCurrentOrganization(null);
          setOrganization(null);
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
