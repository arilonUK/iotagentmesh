
import { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { useAuthProvider } from './useAuthProvider';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const authContextValue = useAuthProvider();

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
