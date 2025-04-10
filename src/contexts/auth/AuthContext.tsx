
import React, { createContext, useContext } from 'react';
import { AuthContextType } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // The implementation has been moved to useAuthProvider.ts
  const authValue = useAuthProvider();
  
  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Import at the end to avoid circular dependencies
import { useAuthProvider } from './useAuthProvider';
