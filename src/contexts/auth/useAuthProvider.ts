
import { useState } from 'react';
import { AuthContextType, UserOrganization, Profile, Organization } from './types';
import { authServices } from './authServices';
import { profileServices } from '@/services/profileServices';
import { useSessionManager } from './useSessionManager';
import { useOrganizationManager } from '@/hooks/useOrganizationManager';
import { useOrganizationLoader } from '@/hooks/useOrganizationLoader';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export const useAuthProvider = (): AuthContextType & {
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setUserId: React.Dispatch<React.SetStateAction<string | null>>;
  setUserEmail: React.Dispatch<React.SetStateAction<string | null>>;
  setUserRole: React.Dispatch<React.SetStateAction<string | null>>;
  setOrganizations: React.Dispatch<React.SetStateAction<UserOrganization[]>>;
  setCurrentOrganization: React.Dispatch<React.SetStateAction<UserOrganization | null>>;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  setOrganization: React.Dispatch<React.SetStateAction<Organization | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setUserOrganizations: React.Dispatch<React.SetStateAction<UserOrganization[]>>;
} => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<UserOrganization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<UserOrganization | null>(null);
  
  // Extended state
  const {
    session,
    user,
    profile,
    loading,
    fetchProfile,
    setSession,
    setUser,
    setProfile,
    setLoading
  } = useSessionManager();

  const {
    organization,
    userRole: orgUserRole,
    switchOrganization,
    fetchOrganizationData,
    setOrganization,
  } = useOrganizationManager(user?.id);

  const { 
    userOrganizations, 
    setUserOrganizations 
  } = useOrganizationLoader({
    userId: user?.id,
    profile,
    fetchOrganizationData
  });

  const { toast } = useToast();

  // Wrapper functions to match the expected return types
  const login = async (email: string, password: string) => {
    return authServices.signIn(email, password);
  };

  const signup = async (email: string, password: string, metadata?: any) => {
    return authServices.signUp(email, password, metadata);
  };

  const logout = async () => {
    return authServices.signOut();
  };

  const signIn = async (email: string, password: string) => {
    return authServices.signIn(email, password);
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    return authServices.signUp(email, password, metadata);
  };

  const signOut = async () => {
    return authServices.signOut();
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!user?.id) return null;
    return profileServices.updateProfile(profileData);
  };

  return {
    isAuthenticated,
    isLoading,
    userId,
    userEmail,
    userRole: userRole || orgUserRole,
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
    updateProfile,

    // State setters for AuthProvider
    setIsAuthenticated,
    setIsLoading,
    setUserId,
    setUserEmail,
    setUserRole,
    setOrganizations,
    setCurrentOrganization,
    setSession,
    setUser,
    setProfile,
    setOrganization,
    setLoading,
    setUserOrganizations,
  };
};
