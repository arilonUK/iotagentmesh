
import { ReactNode, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { organizationService } from '@/services/profile/organizationService';
import { AuthContext } from './AuthContext';
import { useAuthProvider } from './useAuthProvider';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const authState = useAuthProvider();
  const { toast } = useToast();
  const initializingRef = useRef(false);
  const organizationFetchRef = useRef<Map<string, Promise<void>>>(new Map());
  
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
        
        // Set loading to false immediately after auth is confirmed
        setIsLoading(false);
        setLoading(false);
        console.log("AuthProvider: Auth initialization completed");
        
        // Load organizations asynchronously - don't block auth completion
        loadUserOrganizations(data.user.id).catch(error => {
          console.error("AuthProvider: Organization load failed:", error);
          // Continue with basic authentication even if org fetch fails
        });
        
      } catch (error) {
        console.error("AuthProvider: Error checking authentication:", error);
        setIsAuthenticated(false);
        setIsLoading(false);
        setLoading(false);
      } finally {
        initializingRef.current = false;
      }
    };

    const loadUserOrganizations = async (userId: string): Promise<void> => {
      // Prevent multiple simultaneous organization fetches for the same user
      const existingFetch = organizationFetchRef.current.get(userId);
      if (existingFetch) {
        console.log("AuthProvider: Organization fetch already in progress, waiting...");
        return existingFetch;
      }
      
      const fetchPromise = (async () => {
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
        } finally {
          // Clean up the fetch reference
          organizationFetchRef.current.delete(userId);
        }
      })();
      
      // Store the promise to prevent duplicate fetches
      organizationFetchRef.current.set(userId, fetchPromise);
      
      return fetchPromise;
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
          
          setIsLoading(false);
          setLoading(false);
          
          // Load organizations asynchronously - don't block sign-in
          loadUserOrganizations(session.user.id).catch(error => {
            console.error("AuthProvider: Organization load failed on sign-in:", error);
          });
          
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
          
          // Clear organization cache and fetch references
          organizationService.clearCache();
          organizationFetchRef.current.clear();
          initializingRef.current = false;
          
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
      organizationFetchRef.current.clear();
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
