
import { Database } from '@/integrations/supabase/types';

// Separate organization data interface for entities vs user organization membership
export interface OrganizationEntity {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
  logo?: string;
}

export interface OrganizationData extends OrganizationEntity {
  role: string;
  is_default: boolean;
}

export interface OrganizationMember {
  id: string;
  user_id: string;
  role: string;
  email: string;
  full_name: string;
  username: string;
  created_at?: string;
  updated_at?: string;
}

// Define types for organization users
export type OrganizationUser = {
  id: string;
  user_id: string;
  role: string;
  email?: string;
  full_name?: string;
  username?: string;
};

// Define the type for the RPC function response
export type OrgMemberResponse = {
  id: string;
  user_id: string;
  role: string;
  username: string;
  full_name: string;
  email: string;
};

export type RoleType = Database["public"]["Enums"]["role_type"];
