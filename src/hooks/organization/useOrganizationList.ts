
import { useState } from 'react';
import { UserOrganization } from '@/contexts/auth/types';

export type OrganizationListReturn = {
  userOrganizations: UserOrganization[];
  setUserOrganizations: (orgs: UserOrganization[]) => void;
};

export const useOrganizationList = (): OrganizationListReturn => {
  const [userOrganizations, setUserOrganizations] = useState<UserOrganization[]>([]);

  return {
    userOrganizations,
    setUserOrganizations,
  };
};
