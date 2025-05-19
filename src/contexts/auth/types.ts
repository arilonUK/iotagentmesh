
import { User, Session } from '@supabase/supabase-js';

export interface UserOrganization {
  id: string;
  name: string;
  slug: string;
  role: string;
  is_default: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  created_at?: string;
  updated_at?: string;
}

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

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  userEmail: string | null;
  userRole: string | null;
  organizations: UserOrganization[];
  currentOrganization: UserOrganization | null;
  login: (email: string, password: string) => Promise<{ error: any } | undefined>;
  signup: (email: string, password: string, metadata?: any) => Promise<{ error: any } | undefined>;
  logout: () => Promise<void>;
  switchOrganization: (organizationId: string) => Promise<boolean>;
  
  // Additional properties needed based on errors
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  organization: Organization | null;
  userOrganizations: UserOrganization[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any } | undefined>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any } | undefined>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: Partial<Profile>) => Promise<Profile | null>;
}
