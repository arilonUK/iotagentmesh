
import { useEffect, useState } from 'react';
import { authStateManager, AuthStateData } from '@/services/auth/AuthStateManager';
import { authService } from '@/services/auth/AuthServiceLayer';
import { AuthContextType } from '@/contexts/auth/types';

export const useUnifiedAuth = (): AuthContextType => {
  const [authState, setAuthState] = useState<AuthStateData>(authStateManager.getState());

  useEffect(() => {
    console.log('useUnifiedAuth: Setting up auth state subscription');
    
    // Subscribe to auth state changes
    const unsubscribe = authStateManager.subscribe((newState) => {
      console.log('useUnifiedAuth: Auth state updated:', newState.state, newState.user?.id);
      setAuthState(newState);
    });

    // Initialize session
    authService.initializeSession();

    return () => {
      console.log('useUnifiedAuth: Cleaning up subscription');
      unsubscribe();
    };
  }, []);

  // Derived state
  const isAuthenticated = authState.state === 'authenticated';
  const loading = authState.state === 'loading';
  const userId = authState.user?.id || null;
  const userEmail = authState.user?.email || null;
  const userRole = authState.currentOrganization?.role || null;

  const signOut = async (): Promise<void> => {
    console.log('useUnifiedAuth: Sign out requested');
    try {
      await authService.signOut();
    } catch (error) {
      console.error('useUnifiedAuth: Error during sign out:', error);
      throw error;
    }
  };

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
    signOut,
    updateProfile: authService.updateProfile.bind(authService),
    switchOrganization: authService.switchOrganization.bind(authService),
    
    // Legacy method names
    login: authService.signIn.bind(authService),
    signup: authService.signUp.bind(authService),
    logout: signOut,
  };
};
