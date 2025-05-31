
import { useEffect, useState } from 'react';
import { authStateManager, AuthStateData } from '@/services/auth/AuthStateManager';
import { authService } from '@/services/auth/AuthServiceLayer';
import { AuthContextType } from '@/contexts/auth/types';

export const useUnifiedAuth = (): AuthContextType => {
  const [authState, setAuthState] = useState<AuthStateData>(authStateManager.getState());

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authStateManager.subscribe((newState) => {
      setAuthState(newState);
    });

    // Initialize session
    authService.initializeSession();

    return unsubscribe;
  }, []);

  // Derived state
  const isAuthenticated = authState.state === 'authenticated';
  const loading = authState.state === 'loading';
  const userId = authState.user?.id || null;
  const userEmail = authState.user?.email || null;
  const userRole = authState.currentOrganization?.role || null;

  return {
    // Core auth state
    isAuthenticated,
    userId,
    userEmail,
    session: authState.session,
    user: authState.user,
    loading,
    
    // Profile
    profile: authState.profile,
    
    // Organizations
    userOrganizations: authState.userOrganizations,
    currentOrganization: authState.currentOrganization,
    organization: authState.organization,
    userRole,
    
    // Legacy compatibility
    isLoading: loading,
    organizations: authState.userOrganizations,
    
    // Actions - delegate to auth service
    signIn: authService.signIn.bind(authService),
    signUp: authService.signUp.bind(authService),
    signOut: authService.signOut.bind(authService),
    updateProfile: authService.updateProfile.bind(authService),
    switchOrganization: authService.switchOrganization.bind(authService),
    
    // Legacy method names
    login: authService.signIn.bind(authService),
    signup: authService.signUp.bind(authService),
    logout: authService.signOut.bind(authService),
  };
};
