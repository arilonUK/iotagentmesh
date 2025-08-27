
import { organizationService } from '@/services/profile/organizationService';

interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  role: string;
  is_default: boolean;
}

type SwitcherProps = {
  userId: string | null;
  setUserOrganizations: (orgs: OrganizationData[]) => void;
  setCurrentOrganization: (org: OrganizationData) => void;
  setOrganization: (org: OrganizationData) => void;
};

export const useOrganizationSwitcher = ({
  userId,
  setUserOrganizations,
  setCurrentOrganization,
  setOrganization,
}: SwitcherProps) => {
  const switchOrganization = async (organizationId: string): Promise<boolean> => {
    if (!userId || !organizationId) return false;
    
    try {
      const success = await organizationService.switchOrganization(userId, organizationId);
      
      if (success) {
        // Refresh organization list
        const userOrgs = await organizationService.getUserOrganizations(userId);
        if (userOrgs && userOrgs.length > 0) {
          setUserOrganizations(userOrgs);
          const switchedOrg = userOrgs.find(org => org.id === organizationId);
          if (switchedOrg) {
            setCurrentOrganization(switchedOrg);
            setOrganization({
              id: switchedOrg.id,
              name: switchedOrg.name,
              slug: switchedOrg.slug,
              role: switchedOrg.role,
              is_default: switchedOrg.is_default
            });
          }
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error switching organization:', error);
      return false;
    }
  };

  return { switchOrganization };
};
