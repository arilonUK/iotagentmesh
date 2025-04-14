
import { useEffect, useRef } from 'react';
import { Organization, UserOrganization } from '@/contexts/auth/types';
import { useOrganizationData } from './organization/useOrganizationData';
import { useOrganizationSwitcher } from './organization/useOrganizationSwitcher';
import { useOrganizationList } from './organization/useOrganizationList';

export type OrganizationManagerReturn = {
  organization: Organization | null;
  userRole: string | null;
  userOrganizations: UserOrganization[];
  switchOrganization: (organizationId: string) => Promise<boolean>;
  fetchOrganizationData: (orgId: string, userId: string) => Promise<void>;
  setUserOrganizations: (orgs: UserOrganization[]) => void;
};

export const useOrganizationManager = (userId: string | undefined): OrganizationManagerReturn => {
  const { organization, userRole, fetchOrganizationData } = useOrganizationData();
  const { switchOrganization: switchOrg, isProcessingSwitch } = useOrganizationSwitcher();
  const { userOrganizations, setUserOrganizations } = useOrganizationList();

  // Combine the switch organization functionality
  const switchOrganization = async (organizationId: string): Promise<boolean> => {
    if (!userId) return false;
    
    const success = await switchOrg(organizationId, userId);
    
    if (success) {
      // Update the current organization in the userOrganizations list
      setUserOrganizations(prevOrgs => 
        prevOrgs.map(org => ({
          ...org,
          is_default: org.id === organizationId
        }))
      );

      // Fetch organization data but don't wait for it
      fetchOrganizationData(organizationId, userId);
      return true;
    }
    
    return false;
  };

  return {
    organization,
    userRole,
    userOrganizations,
    switchOrganization,
    fetchOrganizationData,
    setUserOrganizations,
  };
};
