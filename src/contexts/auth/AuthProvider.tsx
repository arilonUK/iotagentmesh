
import { ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { organizationService } from '@/services/profile/organizationService';
import { AuthContext } from './AuthContext';
import { useAuthProvider } from './useAuthProvider';
import { profileServices } from '@/services/profileServices';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const authState = useAuthProvider();
  const { toast } = useToast();
  
  const { 
    setIsAuthenticated,
    setUserId,
    setUserEmail,
    setUser,
    setSession,
    setProfile,
    setOrganizations,
    setUserOrganizations,
    setCurrentOrganization,
    setUserRole,
    setOrganization,
    setIsLoading,
    setLoading
  } = authState;

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error || !data?.user) {
          setIsAuthenticated(false);
          setIsLoading(false);
          setLoading(false);
          return;
        }

        setIsAuthenticated(true);
        setUserId(data.user.id);
        setUserEmail(data.user.email);
        setUser(data.user);
        
        // Get session
        const { data: sessionData } = await supabase.auth.getSession();
        setSession(sessionData.session);
        
        // Fetch user organizations
        const userOrgs = await organizationService.getUserOrganizations(data.user.id);
        setOrganizations(userOrgs);
        setUserOrganizations(userOrgs);
        
        // Set current organization based on default
        const defaultOrg = userOrgs.find(org => org.is_default) || userOrgs[0];
        if (defaultOrg) {
          setCurrentOrganization(defaultOrg);
          setUserRole(defaultOrg.role);
          
          // Set organization for extended context
          setOrganization({
            id: defaultOrg.id,
            name: defaultOrg.name,
            slug: defaultOrg.slug
          });
        }

        setIsLoading(false);
        setLoading(false);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
        setIsLoading(false);
        setLoading(false);
      }
    };

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setIsAuthenticated(true);
          setUserId(session.user.id);
          setUserEmail(session.user.email);
          setUser(session.user);
          setSession(session);
          
          // Fetch user organizations
          const userOrgs = await organizationService.getUserOrganizations(session.user.id);
          setOrganizations(userOrgs);
          setUserOrganizations(userOrgs);
          
          // Set current organization based on default
          const defaultOrg = userOrgs.find(org => org.is_default) || userOrgs[0];
          if (defaultOrg) {
            setCurrentOrganization(defaultOrg);
            setUserRole(defaultOrg.role);
            
            // Set organization for extended context
            setOrganization({
              id: defaultOrg.id,
              name: defaultOrg.name,
              slug: defaultOrg.slug
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setUserId(null);
          setUserEmail(null);
          setUserRole(null);
          setOrganizations([]);
          setCurrentOrganization(null);
          setUser(null);
          setSession(null);
          setProfile(null);
          setOrganization(null);
          setUserOrganizations([]);
        }
      }
    );

    checkAuth();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [
    setIsAuthenticated,
    setUserId,
    setUserEmail,
    setUser,
    setSession,
    setProfile,
    setOrganizations,
    setUserOrganizations,
    setCurrentOrganization,
    setUserRole,
    setOrganization,
    setIsLoading,
    setLoading
  ]);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};
