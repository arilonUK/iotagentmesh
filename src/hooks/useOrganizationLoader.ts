
import { useState, useEffect } from 'react';
import { UserOrganization, Profile } from '@/contexts/auth/types';
import { organizationService } from '@/services/profile/organizationService';

type OrganizationLoaderProps = {
  userId: string | undefined;
  profile: Profile | null;
  fetchOrganizationData: (orgId: string, userId: string) => Promise<void>;
};

export const useOrganizationLoader = ({ userId, profile, fetchOrganizationData }: OrganizationLoaderProps) => {
  const [userOrganizations, setUserOrganizations] = useState<UserOrganization[]>([]);

  // Load initial organizations when userId or profile changes
  useEffect(() => {
    const loadOrganizations = async () => {
      if (!userId) return;
      
      try {
        console.log('Loading organizations for user:', userId);
        const orgs = await organizationService.getUserOrganizations(userId);
        
        if (orgs && orgs.length > 0) {
          console.log('Loaded user organizations:', orgs.length);
          setUserOrganizations(orgs);

          // If we have a profile with a default org, select it
          if (profile?.default_organization_id) {
            const defaultOrg = orgs.find(org => org.id === profile.default_organization_id);
            
            if (defaultOrg) {
              console.log('Loading data for default organization:', defaultOrg.name);
              await fetchOrganizationData(defaultOrg.id, userId);
            } else if (orgs[0]) {
              // Fallback to the first org if default not found
              console.log('Default organization not found, using first organization:', orgs[0].name);
              await fetchOrganizationData(orgs[0].id, userId);
            }
          } else if (orgs[0]) {
            // No default org set in profile, use the first one
            console.log('No default organization set, using first organization:', orgs[0].name);
            await fetchOrganizationData(orgs[0].id, userId);
          }
        } else {
          console.log('No organizations found for user');
        }
      } catch (error) {
        console.error('Error loading organizations:', error);
      }
    };

    if (userId) {
      loadOrganizations();
    }
  }, [userId, profile, fetchOrganizationData]);

  return { userOrganizations, setUserOrganizations };
};
