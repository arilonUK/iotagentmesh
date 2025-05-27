
import { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { useAuthProvider } from './useAuthProvider';
import { useAuthInitializer } from './useAuthInitializer';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const authState = useAuthProvider();
  
  // Initialize authentication and organization loading
  useAuthInitializer(authState);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};
