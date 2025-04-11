
import { useNavigate } from 'react-router-dom';
import { AuthContextType } from './types';
import { authServices } from './authServices';
import { profileServices } from './profileServices';
import { useSessionManager } from './useSessionManager';
import { useOrganizationManager } from './useOrganizationManager';
import { supabase } from '@/integrations/supabase/client';

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

  // When profile is loaded and has a default organization, fetch that organization's data
  if (profile?.default_organization_id && user && !organization) {
    // Fetch user's organizations
    profileServices.getUserOrganizations(user.id).then(orgs => {
      setUserOrganizations(orgs);
      // Fetch default organization data
      if (profile.default_organization_id) {
        fetchOrganizationData(profile.default_organization_id, user.id);
      }
    });
  }

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
