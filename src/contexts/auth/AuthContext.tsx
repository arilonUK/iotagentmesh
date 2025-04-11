
import React, { createContext, useContext } from 'react';
import { useAuthProvider } from './useAuthProvider';
import { AuthContextType } from './types';

// Create the auth context first
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authValue = useAuthProvider();
  
  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
};

// Define the useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
