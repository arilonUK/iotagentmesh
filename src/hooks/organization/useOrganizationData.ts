
import { useState } from 'react';
import { Organization } from '@/contexts/auth/types';
import { useUserOrganizationRole } from './useUserOrganizationRole';
import { useOrganizationEntity } from './useOrganizationEntity';
import { useOrganizationMembership } from './useOrganizationMembership';

export type OrganizationDataReturn = {
  organization: Organization | null;
  userRole: string | null;
  fetchOrganizationData: (orgId: string, userId: string) => Promise<void>;
  setOrganization: React.Dispatch<React.SetStateAction<Organization | null>>;
};

export const useOrganizationData = (): OrganizationDataReturn => {
  const { userRole, setUserRole, fetchUserRole } = useUserOrganizationRole();
  const { organization, setOrganization, fetchOrganizationEntity } = useOrganizationEntity();
  const { createMemberRole } = useOrganizationMembership();

  const fetchOrganizationData = async (orgId: string, userId: string) => {
    try {
      if (!orgId || !userId) {
        console.log('Missing organization ID or user ID');
        return;
      }

      console.log(`Fetching organization data for org: ${orgId}, user: ${userId}`);
      
      // Fetch user role
      await fetchUserRole(orgId, userId);
      
      // Fetch organization entity
      await fetchOrganizationEntity(orgId);
      
      // If role is not set and we have an organization, create a member role
      if (!userRole && organization) {
        const roleCreated = await createMemberRole(orgId, userId);
        if (roleCreated) {
          setUserRole('member');
        }
      }
    } catch (error) {
      console.error('Error fetching organization data:', error);
    }
  };

  return {
    organization,
    userRole,
    fetchOrganizationData,
    setOrganization
  };
};
