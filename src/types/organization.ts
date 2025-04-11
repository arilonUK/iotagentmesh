
import { Database } from '@/integrations/supabase/types';

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
