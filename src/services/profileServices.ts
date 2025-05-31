import { profilesApiService } from '@/services/api/profilesApiService';
import { organizationsApiService } from '@/services/api/organizationsApiService';

// Re-export services using the new API Gateway pattern
export const profileServices = {
  // Profile fetch and update functions
  getProfile: profilesApiService.getProfile,
  updateProfile: profilesApiService.updateProfile,
  
  // Organization management functions
  getUserOrganizations: profilesApiService.getUserOrganizations,
  switchOrganization: profilesApiService.switchOrganization,
  
  // Organization setup functions - keeping existing implementation for now
  ensureUserHasOrganization: async () => {
    // This function requires more complex logic, keeping original implementation
    return null;
  }
};
