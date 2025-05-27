
import { organizationService } from '@/services/profile/organizationService';

type SwitcherProps = {
  userId: string | null;
  setUserOrganizations: (orgs: any[]) => void;
  setCurrentOrganization: (org: any) => void;
  setOrganization: (org: any) => void;
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
              slug: switchedOrg.slug
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
