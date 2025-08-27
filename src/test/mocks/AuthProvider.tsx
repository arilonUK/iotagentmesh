import { ReactNode } from 'react';
import { AuthContext } from '@/contexts/auth/AuthContext';
import { AuthContextType } from '@/contexts/auth/types';

const mockAuthContextValue: AuthContextType = {
  isAuthenticated: false,
  isLoading: false,
  userId: null,
  userEmail: null,
  userRole: null,
  organizations: [],
  currentOrganization: null,
  session: null,
  user: null,
  profile: null,
  organization: null,
  userOrganizations: [],
  loading: false,
  login: async () => ({ data: { user: null, session: null } }),
  signup: async () => ({ data: { user: null, session: null } }),
  logout: async () => {},
  signIn: async () => ({ data: { user: null, session: null } }),
  signUp: async () => ({ data: { user: null, session: null } }),
  signOut: async () => {},
  switchOrganization: async () => true,
  updateProfile: async () => null,
};

export const MockAuthProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AuthContext.Provider value={mockAuthContextValue}>
      {children}
    </AuthContext.Provider>
  );
};