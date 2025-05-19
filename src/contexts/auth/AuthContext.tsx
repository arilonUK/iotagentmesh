
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { organizationService } from '@/services/profile/organizationService';
import { AuthContextType, UserOrganization, Profile, Organization } from './types';
import { User, Session } from '@supabase/supabase-js';
import { profileServices } from '@/services/profileServices';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<UserOrganization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<UserOrganization | null>(null);
  
  // Additional states for extended AuthContextType
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userOrganizations, setUserOrganizations] = useState<UserOrganization[]>([]);
  
  const { toast } = useToast();

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
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
        variant: "default"
      });
      return undefined;

    } catch (error) {
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signIn = login; // Alias for login

  const signup = async (email: string, password: string, metadata?: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }
      
      toast({
        title: "Signup successful",
        description: "Please check your email for verification",
        variant: "default"
      });
      return undefined;

    } catch (error) {
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return { error };
    }
  };
  
  const signUp = signup; // Alias for signup

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout successful",
        description: "You have been logged out",
        variant: "default"
      });
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "Logout failed",
        description: "An error occurred during logout",
        variant: "destructive"
      });
    }
  };
  
  const signOut = logout; // Alias for logout

  const switchOrganization = async (organizationId: string) => {
    try {
      const success = await organizationService.switchOrganization(userId!, organizationId);
      
      if (success) {
        // Update current organization
        const org = organizations.find(o => o.id === organizationId);
        if (org) {
          setCurrentOrganization(org);
          setUserRole(org.role);
          
          // Update organization list to reflect new default
          setOrganizations(prevOrgs => 
            prevOrgs.map(o => ({
              ...o,
              is_default: o.id === organizationId
            }))
          );
          
          // Update organization for extended context
          setOrganization({
            id: org.id,
            name: org.name,
            slug: org.slug
          });
          
          // Also update userOrganizations to stay in sync
          setUserOrganizations(prevOrgs => 
            prevOrgs.map(o => ({
              ...o,
              is_default: o.id === organizationId
            }))
          );
        }
      }
      
      return success;
    } catch (error) {
      console.error("Error switching organization:", error);
      return false;
    }
  };
  
  // Update the updateProfile function signature to match the one in types.ts
  const updateProfile = async (profileData: Partial<Profile>): Promise<Profile | null> => {
    try {
      if (!user) return null;
      
      // Update profile using the profileServices
      const updatedProfile = await profileServices.updateProfile(profileData);
      
      // Update the local state
      setProfile((currentProfile) => {
        if (!currentProfile) return null;
        return { ...currentProfile, ...profileData };
      });
      
      return updatedProfile;
    } catch (error) {
      console.error("Error updating profile:", error);
      return null;
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    userId,
    userEmail,
    userRole,
    organizations,
    currentOrganization,
    login,
    signup,
    logout,
    switchOrganization,
    
    // Extended context properties
    session,
    user,
    profile,
    organization,
    userOrganizations,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
