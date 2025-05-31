
import { useState } from 'react';
import { toast } from 'sonner';
import { UserOrganization } from '@/contexts/auth/types';
import { profileServices } from '@/services/profileServices';

export type OrganizationSwitcherReturn = {
  switchOrganization: (organizationId: string) => Promise<boolean>;
  isProcessingSwitch: boolean;
};

export const useOrganizationSwitcher = (): OrganizationSwitcherReturn => {
  const [isProcessingSwitch, setIsProcessingSwitch] = useState<boolean>(false);

  const switchOrganization = async (organizationId: string): Promise<boolean> => {
    if (!organizationId) {
      toast('Invalid organization ID', {
        style: { backgroundColor: 'red', color: 'white' }
      });
      return false;
    }

    // Prevent multiple simultaneous switches
    if (isProcessingSwitch) {
      console.log('Organization switch already in progress');
      return false;
    }

    try {
      setIsProcessingSwitch(true);
      console.log(`Switching organization to: ${organizationId}`);
      
      const success = await profileServices.switchOrganization(organizationId);
      return success;
    } catch (error) {
      console.error('Error switching organization:', error);
      return false;
    } finally {
      // Always reset processing state when done
      setIsProcessingSwitch(false);
    }
  };

  return {
    switchOrganization,
    isProcessingSwitch
  };
};
