
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
    let isInitialized = false;
    
    // Check if user is already authenticated
    const checkAuth = async () => {
      if (isInitialized) return;
      
      try {
        console.log("AuthProvider: Checking initial auth state");
        const { data, error } = await supabase.auth.getUser();
        
        if (error || !data?.user) {
          console.log("AuthProvider: No authenticated user found");
          setIsAuthenticated(false);
          setIsLoading(false);
          setLoading(false);
          return;
        }

        console.log("AuthProvider: User found, setting basic auth state");
        setIsAuthenticated(true);
        setUserId(data.user.id);
        setUserEmail(data.user.email);
        setUser(data.user);
        
        // Get session
        const { data: sessionData } = await supabase.auth.getSession();
        setSession(sessionData.session);
        
        // Try to fetch user organizations with comprehensive error handling
        try {
          console.log("AuthProvider: Fetching user organizations");
          const userOrgs = await organizationService.getUserOrganizations(data.user.id);
          console.log("AuthProvider: Organizations fetch result:", userOrgs);
          
          if (userOrgs && userOrgs.length > 0) {
            console.log("AuthProvider: Successfully fetched organizations:", userOrgs.length);
            
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
          } else {
            console.log("AuthProvider: No organizations found, proceeding with basic auth");
            setOrganizations([]);
            setUserOrganizations([]);
            setCurrentOrganization(null);
            setUserRole(null);
            setOrganization(null);
          }
        } catch (orgError: any) {
          console.error("AuthProvider: Error fetching organizations, continuing with basic auth:", orgError);
          
          // Show a warning toast if it's the infinite recursion error
          if (orgError.code === '42P17' || orgError.message?.includes('infinite recursion')) {
            console.warn("AuthProvider: Database policy issue detected - infinite recursion in organization_members table");
          }
          
          // Continue with basic authentication even if org fetch fails
          setOrganizations([]);
          setUserOrganizations([]);
          setCurrentOrganization(null);
          setUserRole(null);
          setOrganization(null);
        }

        // Always complete the auth process
        setIsLoading(false);
        setLoading(false);
        console.log("AuthProvider: Auth initialization completed successfully");
      } catch (error) {
        console.error("AuthProvider: Error checking authentication:", error);
        setIsAuthenticated(false);
        setIsLoading(false);
        setLoading(false);
      }
    };

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("AuthProvider: Auth state change:", event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log("AuthProvider: User signed in");
          setIsAuthenticated(true);
          setUserId(session.user.id);
          setUserEmail(session.user.email);
          setUser(session.user);
          setSession(session);
          
          // Try to fetch user organizations with error handling
          try {
            const userOrgs = await organizationService.getUserOrganizations(session.user.id);
            
            if (userOrgs && userOrgs.length > 0) {
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
            } else {
              console.log("AuthProvider: No organizations found during sign in");
              setOrganizations([]);
              setUserOrganizations([]);
              setCurrentOrganization(null);
              setUserRole(null);
              setOrganization(null);
            }
          } catch (orgError: any) {
            console.error("AuthProvider: Error fetching organizations during sign in, continuing with basic auth:", orgError);
            // Continue with basic authentication even if org fetch fails
            setOrganizations([]);
            setUserOrganizations([]);
            setCurrentOrganization(null);
            setUserRole(null);
            setOrganization(null);
          }
          
          setIsLoading(false);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          console.log("AuthProvider: User signed out");
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
          setIsLoading(false);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log("AuthProvider: Token refreshed");
          setSession(session);
          setUser(session.user);
        }
      }
    );

    // Initialize auth check
    checkAuth().then(() => {
      isInitialized = true;
    });

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
