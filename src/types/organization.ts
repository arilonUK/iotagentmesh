import { Organization as BaseOrganization } from '@/contexts/auth/types';

export interface OrganizationMember {
  user_id: string;
  role: string;
}

export interface OrganizationData extends BaseOrganization {
  members: OrganizationMember[];
}
