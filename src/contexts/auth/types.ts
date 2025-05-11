import { Session, User } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

// We need to explicitly define these since the types file hasn't been updated yet
export type Organization = {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  created_at: string;
  updated_at: string;
};

export type OrganizationMember = {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  created_at: string;
  updated_at: string;
};

export type UserOrganization = {
  id: string;
  name: string;
  slug: string;
  role: string;
  is_default: boolean;
};

// Add this type if it doesn't exist already
export interface UserData {
  full_name?: string;
  username?: string;
  organization_name?: string;
}

export type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  organization: Organization | null;
  userRole: string | null;
  loading: boolean;
  userOrganizations: UserOrganization[];
  signUp: (email: string, password: string, userData?: UserData) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
  switchOrganization: (organizationId: string) => Promise<boolean>;
};
