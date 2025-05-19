
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

  return {
    isAuthenticated,
    isLoading,
    userId,
    userEmail,
    userRole: userRole || orgUserRole,
    organizations,
    currentOrganization,
    login: authServices.signIn,
    signup: authServices.signUp,
    logout: authServices.signOut,
    switchOrganization,
    
    // Extended context properties
    session,
    user,
    profile,
    organization,
    userOrganizations,
    loading,
    signIn: authServices.signIn,
    signUp: authServices.signUp,
    signOut: authServices.signOut,
    updateProfile: profileServices.updateProfile
  };
};
