
import { RoleType } from '@/types/organization';

export type InvitationType = {
  id: string;
  organization_id: string;
  email: string;
  role: RoleType;
  token: string;
  created_at: string;
  expires_at: string;
};

export type CreateInvitationParams = {
  email: string;
  role: RoleType;
  organizationId: string;
};
