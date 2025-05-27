
import { AuthContextType } from './types';
import { useAuthState } from './useAuthState';
import { useAuthActions } from './useAuthActions';
import { useAuthListener } from './useAuthListener';
import { useOrganizationSwitcher } from './useOrganizationSwitcher';

export const useAuthProvider = (): AuthContextType => {
  const authState = useAuthState();
  const authActions = useAuthActions();

  // Set up auth listener
  useAuthListener({
    setSession: authState.setSession,
    setUser: authState.setUser,
    setIsAuthenticated: authState.setIsAuthenticated,
    setLoading: authState.setLoading,
    setUserOrganizations: authState.setUserOrganizations,
    setCurrentOrganization: authState.setCurrentOrganization,
    setOrganization: authState.setOrganization,
    setProfile: authState.setProfile,
  });

  // Set up organization switcher
  const { switchOrganization } = useOrganizationSwitcher({
    userId: authState.userId,
    setUserOrganizations: authState.setUserOrganizations,
    setCurrentOrganization: authState.setCurrentOrganization,
    setOrganization: authState.setOrganization,
  });

  return {
    // Auth state
    isAuthenticated: authState.isAuthenticated,
    userId: authState.userId,
    userEmail: authState.userEmail,
    session: authState.session,
    user: authState.user,
    loading: authState.loading,
    
    // Profile
    profile: authState.profile,
    
    // Organizations
    userOrganizations: authState.userOrganizations,
    currentOrganization: authState.currentOrganization,
    organization: authState.organization,
    userRole: authState.userRole,
    
    // Legacy compatibility
    isLoading: authState.loading,
    organizations: authState.userOrganizations,
    
    // Actions
    ...authActions,
    switchOrganization,
    
    // Legacy method names
    login: authActions.signIn,
    signup: authActions.signUp,
    logout: authActions.signOut,
  };
};
