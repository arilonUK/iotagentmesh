
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { organizationService } from '@/services/profile/organizationService';

type AuthListenerProps = {
  setSession: (session: any) => void;
  setUser: (user: any) => void;
  setIsAuthenticated: (auth: boolean) => void;
  setLoading: (loading: boolean) => void;
  setUserOrganizations: (orgs: any[]) => void;
  setCurrentOrganization: (org: any) => void;
  setOrganization: (org: any) => void;
  setProfile: (profile: any) => void;
};

export const useAuthListener = ({
  setSession,
  setUser,
  setIsAuthenticated,
  setLoading,
  setUserOrganizations,
  setCurrentOrganization,
  setOrganization,
  setProfile,
}: AuthListenerProps) => {
  const initializingRef = useRef(false);
  const listenerRef = useRef<any>(null);

  useEffect(() => {
    if (initializingRef.current) {
      return;
    }
    initializingRef.current = true;

    const initializeAuth = async () => {
      try {
        console.log("Setting up auth listener...");

        // Clean up any existing listener
        if (listenerRef.current) {
          listenerRef.current.subscription.unsubscribe();
        }

        // Set up auth state listener
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("Auth state change:", event);
            
            if (event === 'SIGNED_IN' && session?.user) {
              setSession(session);
              setUser(session.user);
              setIsAuthenticated(true);
              setLoading(false);
              
              // Load organizations in background - don't await
              setTimeout(async () => {
                try {
                  const userOrgs = await organizationService.getUserOrganizations(session.user.id);
                  if (userOrgs && userOrgs.length > 0) {
                    setUserOrganizations(userOrgs);
                    const defaultOrg = userOrgs.find(org => org.is_default) || userOrgs[0];
                    if (defaultOrg) {
                      setCurrentOrganization(defaultOrg);
                      setOrganization({
                        id: defaultOrg.id,
                        name: defaultOrg.name,
                        slug: defaultOrg.slug
                      });
                    }
                  }
                } catch (error) {
                  console.error("Error loading organizations:", error);
                }
              }, 100);
              
            } else if (event === 'SIGNED_OUT') {
              setSession(null);
              setUser(null);
              setIsAuthenticated(false);
              setLoading(false);
              setUserOrganizations([]);
              setCurrentOrganization(null);
              setOrganization(null);
              setProfile(null);
              organizationService.clearCache();
            } else if (event === 'TOKEN_REFRESHED' && session) {
              setSession(session);
              setUser(session.user);
            }
          }
        );

        listenerRef.current = authListener;

        // Check for existing session
        const { data, error } = await supabase.auth.getUser();
        
        if (error || !data?.user) {
          console.log("No authenticated user found");
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        console.log("User found, setting auth state");
        setIsAuthenticated(true);
        setUser(data.user);
        
        // Get session
        const { data: sessionData } = await supabase.auth.getSession();
        setSession(sessionData.session);
        setLoading(false);

      } catch (error) {
        console.error("Error initializing auth:", error);
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (listenerRef.current) {
        listenerRef.current.subscription.unsubscribe();
      }
      initializingRef.current = false;
    };
  }, []); // Empty dependency array - run once only
};
