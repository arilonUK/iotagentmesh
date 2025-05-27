
import { ReactNode, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { organizationService } from '@/services/profile/organizationService';
import { AuthContext } from './AuthContext';
import { useAuthProvider } from './useAuthProvider';
import { UserOrganization } from './types';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const authState = useAuthProvider();
  const { toast } = useToast();
  const initializingRef = useRef(false);
  const organizationFetchRef = useRef(false);
  
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
    // Prevent multiple initialization attempts
    if (initializingRef.current) {
      console.log("AuthProvider: Already initializing, skipping");
      return;
    }
    
    const checkAuth = async () => {
      if (initializingRef.current) return;
      initializingRef.current = true;
      
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

        console.log("AuthProvider: User found, setting auth state");
        setIsAuthenticated(true);
        setUserId(data.user.id);
        setUserEmail(data.user.email);
        setUser(data.user);
        
        // Get session
        const { data: sessionData } = await supabase.auth.getSession();
        setSession(sessionData.session);
        
        // Load organizations with timeout - don't block auth
        setTimeout(() => {
          loadUserOrganizations(data.user.id);
        }, 100);
        
        // Set loading to false immediately after auth is confirmed
        setIsLoading(false);
        setLoading(false);
        console.log("AuthProvider: Auth initialization completed");
      } catch (error) {
        console.error("AuthProvider: Error checking authentication:", error);
        setIsAuthenticated(false);
        setIsLoading(false);
        setLoading(false);
      } finally {
        initializingRef.current = false;
      }
    };

    const loadUserOrganizations = async (userId: string) => {
      // Prevent multiple simultaneous organization fetches
      if (organizationFetchRef.current) {
        console.log("AuthProvider: Organization fetch already in progress");
        return;
      }
      
      organizationFetchRef.current = true;
      
      try {
        console.log("AuthProvider: Loading user organizations");
        const userOrgs = await organizationService.getUserOrganizations(userId);
        
        if (userOrgs && userOrgs.length > 0) {
          console.log("AuthProvider: Successfully loaded organizations:", userOrgs.length);
          
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
          console.log("AuthProvider: No organizations found or failed to load");
          setOrganizations([]);
          setUserOrganizations([]);
          setCurrentOrganization(null);
          setUserRole(null);
          setOrganization(null);
        }
      } catch (error) {
        console.error("AuthProvider: Error loading organizations:", error);
        // Continue with basic authentication even if org fetch fails
        setOrganizations([]);
        setUserOrganizations([]);
        setCurrentOrganization(null);
        setUserRole(null);
        setOrganization(null);
        
        // Only show toast for non-timeout errors
        if (!error?.message?.includes('timeout') && error?.code !== '42P17') {
          toast({
            title: "Organization data unavailable",
            description: "You're signed in, but organization features may be limited.",
            variant: "default"
          });
        }
      } finally {
        organizationFetchRef.current = false;
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
          
          // Load organizations for the signed-in user with delay
          setTimeout(() => {
            loadUserOrganizations(session.user.id);
          }, 100);
          
          setIsLoading(false);
          setLoading(false);
          
        } else if (event === 'SIGNED_OUT') {
          console.log("AuthProvider: User signed out");
          
          // Clear all state
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
          
          // Clear organization cache
          organizationService.clearCache();
          initializingRef.current = false;
          organizationFetchRef.current = false;
          
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log("AuthProvider: Token refreshed");
          setSession(session);
          setUser(session.user);
        }
      }
    );

    // Initialize auth check
    checkAuth();

    return () => {
      authListener.subscription.unsubscribe();
      initializingRef.current = false;
      organizationFetchRef.current = false;
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
    setLoading,
    toast
  ]);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};
