
import { User, Session } from '@supabase/supabase-js';

import { OrganizationData, OrganizationMember, OrganizationEntity } from '@/types/organization';

export type UserOrganization = OrganizationData;

export type Organization = OrganizationEntity;

export interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  default_organization_id?: string;
  updated_at?: string;
}

export interface UserData {
  username?: string;
  full_name?: string;
  organization_name?: string;
  avatar_url?: string;
}

export type RoleType = 'owner' | 'admin' | 'member' | 'viewer';

export interface AuthResponse {
  error?: Error | null;
  data?: {
    user: User | null;
    session: Session | null;
  } | null;
}

export interface AuthErrorResponse {
  error: Error;
  data?: undefined;
}

export interface UserMetadata {
  username?: string;
  full_name?: string;
  organization_name?: string;
  avatar_url?: string;
  [key: string]: unknown;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  userEmail: string | null;
  userRole: string | null;
  organizations: UserOrganization[];
  currentOrganization: UserOrganization | null;
  login: (email: string, password: string) => Promise<AuthResponse | AuthErrorResponse | undefined>;
  signup: (email: string, password: string, metadata?: UserMetadata) => Promise<AuthResponse | AuthErrorResponse | undefined>;
  logout: () => Promise<void>;
  switchOrganization: (organizationId: string) => Promise<boolean>;
  
  // Additional properties needed based on errors
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  organization: Organization | null;
  userOrganizations: UserOrganization[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse | AuthErrorResponse | undefined>;
  signUp: (email: string, password: string, metadata?: UserMetadata) => Promise<AuthResponse | AuthErrorResponse | undefined>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: Partial<Profile>) => Promise<Profile | null>;
}
