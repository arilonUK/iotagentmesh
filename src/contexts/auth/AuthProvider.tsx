
import { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { useAuthProvider } from './useAuthProvider';
import { useAuthInitializer } from './useAuthInitializer';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const authState = useAuthProvider();
  
  // Initialize authentication and organization loading
  useAuthInitializer({
    setIsAuthenticated: authState.setIsAuthenticated,
    setUserId: authState.setUserId,
    setUserEmail: authState.setUserEmail,
    setUser: authState.setUser,
    setSession: authState.setSession,
    setProfile: authState.setProfile,
    setOrganizations: authState.setOrganizations,
    setUserOrganizations: authState.setUserOrganizations,
    setCurrentOrganization: authState.setCurrentOrganization,
    setUserRole: authState.setUserRole,
    setOrganization: authState.setOrganization,
    setIsLoading: authState.setIsLoading,
    setLoading: authState.setLoading,
  });

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};
