
export interface UserOrganization {
  id: string;
  name: string;
  slug: string;
  role: string;
  is_default: boolean;
}

export type RoleType = 'owner' | 'admin' | 'member';
