
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { profileUpdateService } from './profile/profileUpdateService';
import { organizationService } from './profile/organizationService';
import { organizationSetupService } from './profile/organizationSetupService';
import { profileFetchService } from './profile/profileFetchService';
import { Profile } from '@/contexts/auth/types';

// Re-export services from the individual modules
export const profileServices = {
  // Profile fetch and update functions
  getProfile: profileFetchService.getProfile,
  updateProfile: profileUpdateService.updateProfile,
  
  // Organization management functions
  getUserOrganizations: organizationService.getUserOrganizations,
  switchOrganization: organizationService.switchOrganization,
  
  // Organization setup functions
  ensureUserHasOrganization: organizationSetupService.ensureUserHasOrganization
};
