
import { useState } from 'react';
import { AuthContextType, UserOrganization, Profile, Organization } from './types';
import { authServices } from './authServices';
import { profileServices } from '@/services/profileServices';
import { useSessionManager } from './useSessionManager';
import { useOrganizationManager } from '@/hooks/useOrganizationManager';
import { useOrganizationLoader } from '@/hooks/useOrganizationLoader';
import { User, Session } from '@supabase/supabase-js';

export const useAuthProvider = (): AuthContextType => {
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
    fetchProfile
  } = useSessionManager();

  const {
    organization,
    userRole: orgUserRole,
    switchOrganization,
    fetchOrganizationData,
  } = useOrganizationManager(user?.id);

  const { userOrganizations, setUserOrganizations } = useOrganizationLoader({
    userId: user?.id,
    profile,
    fetchOrganizationData
  });

  // Wrapper functions to match the expected return types
  const login = async (email: string, password: string) => {
    return authServices.signIn(email, password);
  };

  const signup = async (email: string, password: string, metadata?: any) => {
    return authServices.signUp(email, password, metadata);
  };

  const wrapUpdateProfile = async (profileData: Partial<Profile>) => {
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
    logout: authServices.signOut,
    switchOrganization,
    
    // Extended context properties
    session,
    user,
    profile,
    organization,
    userOrganizations,
    loading,
    signIn: login,
    signUp: signup,
    signOut: authServices.signOut,
    updateProfile: wrapUpdateProfile
  };
};
