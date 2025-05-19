
import { useState, useEffect, useCallback } from 'react';
import { Organization, UserOrganization } from './types';
import { useOrganizationData } from '@/hooks/organization/useOrganizationData';

export const useOrganizationManager = (userId: string | undefined) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const { userRole: orgUserRole, fetchOrganizationData } = useOrganizationData();
  
  const switchOrganization = useCallback(async (organizationId: string): Promise<boolean> => {
    if (!userId || !organizationId) return false;
    
    try {
      console.log(`Switching to organization ${organizationId}`);
      
      // Fetch the organization data first
      await fetchOrganizationData(organizationId, userId);
      return true;
    } catch (error) {
      console.error('Error switching organization:', error);
      return false;
    }
  }, [userId, fetchOrganizationData]);

  return {
    organization,
    userRole: orgUserRole,
    switchOrganization,
    fetchOrganizationData,
    setOrganization,
  };
};
