
import { profileUpdateService } from './profile/profileUpdateService';
import { organizationService } from './profile/organizationService';
import { organizationSetupService } from './profile/organizationSetupService';
import { Profile } from '@/contexts/auth/types';

// Re-export services from the individual modules
export const profileServices = {
  // Profile update functions
  updateProfile: profileUpdateService.updateProfile,
  
  // Organization management functions
  getUserOrganizations: organizationService.getUserOrganizations,
  switchOrganization: organizationService.switchOrganization,
  
  // Organization setup functions
  ensureUserHasOrganization: organizationSetupService.ensureUserHasOrganization
};

// Fix circular dependency in organizationSetupService
import { profileServices as profileServicesImport } from './profileServices';
// Workaround to avoid circular dependency issues
(global as any).profileServices = profileServices;
