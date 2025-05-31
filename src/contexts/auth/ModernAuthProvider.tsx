
import { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';

export const ModernAuthProvider = ({ children }: { children: ReactNode }) => {
  const authContextValue = useUnifiedAuth();

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
