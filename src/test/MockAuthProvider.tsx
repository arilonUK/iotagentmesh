import React, { ReactNode } from 'react';
import { AuthContext } from '@/contexts/auth/AuthContext';
import type { AuthContextType, AuthResponse, UserMetadata } from '@/contexts/auth/types';

const resolved: AuthResponse = { data: null };

const mockAuth: AuthContextType = {
  isAuthenticated: true,
  isLoading: false,
  userId: 'test-user',
  userEmail: 'test@example.com',
  userRole: 'admin',
  organizations: [],
  currentOrganization: null,
  login: async () => resolved,
  signup: async (_e: string, _p: string, _m?: UserMetadata) => resolved,
  logout: async () => {},
  switchOrganization: async () => true,
  session: null,
  user: null,
  profile: null,
  organization: null,
  userOrganizations: [],
  loading: false,
  signIn: async () => resolved,
  signUp: async (_e: string, _p: string, _m?: UserMetadata) => resolved,
  signOut: async () => {},
  updateProfile: async () => null,
};

export const MockAuthProvider = ({ children }: { children: ReactNode }) => {
  return <AuthContext.Provider value={mockAuth}>{children}</AuthContext.Provider>;
};
