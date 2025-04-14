
import { useNavigate } from 'react-router-dom';
import { AuthContextType } from './types';
import { authServices } from './authServices';
import { profileServices } from '@/services/profileServices';
import { useSessionManager } from './useSessionManager';
import { useOrganizationManager } from '@/hooks/useOrganizationManager';
import { useOrganizationLoader } from '@/hooks/useOrganizationLoader';

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
    switchOrganization,
    fetchOrganizationData,
  } = useOrganizationManager(user?.id);

  const { userOrganizations, setUserOrganizations } = useOrganizationLoader({
    userId: user?.id,
    profile,
    fetchOrganizationData
  });

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
