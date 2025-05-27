
import { useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Profile, UserOrganization, Organization } from './types';

export const useAuthState = () => {
  // Core auth state
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  
  // Organization state
  const [userOrganizations, setUserOrganizations] = useState<UserOrganization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<UserOrganization | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);

  // Derived state
  const userId = user?.id || null;
  const userEmail = user?.email || null;
  const userRole = currentOrganization?.role || null;

  return {
    // Core auth
    session,
    user,
    isAuthenticated,
    loading,
    userId,
    userEmail,
    
    // Profile
    profile,
    
    // Organizations
    userOrganizations,
    currentOrganization,
    organization,
    userRole,
    
    // Setters
    setSession,
    setUser,
    setIsAuthenticated,
    setLoading,
    setProfile,
    setUserOrganizations,
    setCurrentOrganization,
    setOrganization,
  };
};
