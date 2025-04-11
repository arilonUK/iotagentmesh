
import { useNavigate } from 'react-router-dom';
import { AuthContextType } from './types';
import { authServices } from './authServices';
import { profileServices } from './profileServices';
import { useSessionManager } from './useSessionManager';
import { useOrganizationManager } from './useOrganizationManager';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useRef } from 'react';

export const useAuthProvider = (): AuthContextType => {
  const navigate = useNavigate();
  const orgsLoaded = useRef(false);
  
  const {
    session,
    user,
    profile,
    loading,
    fetchProfile
  } = useSessionManager();

  const {
    organization,
    userRole,
    userOrganizations,
    switchOrganization,
    fetchOrganizationData,
    setUserOrganizations
  } = useOrganizationManager(user?.id);

  // Track if organizations have been loaded to prevent multiple fetches
  useEffect(() => {
    const loadUserOrganizations = async () => {
      if (user?.id && !orgsLoaded.current) {
        console.log('Loading user organizations for', user.id);
        try {
          // Fetch user's organizations
          const orgs = await profileServices.getUserOrganizations(user.id);
          console.log('User organizations loaded:', orgs);
          
          if (orgs && orgs.length > 0) {
            setUserOrganizations(orgs);
            orgsLoaded.current = true;
            
            // Fetch default organization data if it exists
            if (profile?.default_organization_id) {
              console.log('Loading default organization:', profile.default_organization_id);
              await fetchOrganizationData(profile.default_organization_id, user.id);
            } else {
              // Use the first organization as default if no default is set
              const defaultOrg = orgs.find(org => org.is_default) || orgs[0];
              console.log('Using organization as default:', defaultOrg.id);
              await fetchOrganizationData(defaultOrg.id, user.id);
            }
          } else {
            console.log('No organizations found for user');
          }
        } catch (error) {
          console.error('Error loading user organizations:', error);
        }
      }
    };

    loadUserOrganizations();
  }, [user, profile]);

  // Reset organization data when user logs out
  useEffect(() => {
    if (!user) {
      orgsLoaded.current = false;
    }
  }, [user]);

  return {
    session,
    user,
    profile,
    organization,
    userRole,
    userOrganizations,
    loading,
    signUp: authServices.signUp,
    signIn: authServices.signIn,
    signOut: authServices.signOut,
    updateProfile: profileServices.updateProfile,
    switchOrganization
  };
};
