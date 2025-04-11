
import { useNavigate } from 'react-router-dom';
import { AuthContextType } from './types';
import { authServices } from './authServices';
import { profileServices } from './profileServices';
import { useSessionManager } from './useSessionManager';
import { useOrganizationManager } from './useOrganizationManager';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useAuthProvider = (): AuthContextType => {
  const navigate = useNavigate();
  
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
      if (user && !userOrganizations.length) {
        console.log('Loading user organizations for', user.id);
        try {
          // Fetch user's organizations
          const orgs = await profileServices.getUserOrganizations(user.id);
          console.log('User organizations loaded:', orgs);
          setUserOrganizations(orgs);
          
          // Fetch default organization data if it exists
          if (profile?.default_organization_id) {
            console.log('Loading default organization:', profile.default_organization_id);
            fetchOrganizationData(profile.default_organization_id, user.id);
          } else if (orgs.length > 0) {
            // Use the first organization as default if no default is set
            const defaultOrg = orgs.find(org => org.is_default) || orgs[0];
            console.log('Using organization as default:', defaultOrg.id);
            fetchOrganizationData(defaultOrg.id, user.id);
          }
        } catch (error) {
          console.error('Error loading user organizations:', error);
        }
      }
    };

    loadUserOrganizations();
  }, [user, profile, userOrganizations.length, fetchOrganizationData]);

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
