
import { profileServices } from '@/services/profileServices';
import { organizationService } from '@/services/profile/organizationService';
import { AuthStateManager } from './AuthStateManager';
import { Profile } from '@/contexts/auth/types';

export class ProfileService {
  private stateManager: AuthStateManager;

  constructor(stateManager: AuthStateManager) {
    this.stateManager = stateManager;
  }

  async updateProfile(profileData: Partial<Profile>) {
    try {
      const result = await profileServices.updateProfile(profileData);
      if (result) {
        this.stateManager.dispatch({ type: 'SET_PROFILE', payload: result });
      }
      return result;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async switchOrganization(organizationId: string): Promise<boolean> {
    try {
      const state = this.stateManager.getState();
      if (!state.user) return false;

      const success = await organizationService.switchOrganization(state.user.id, organizationId);
      
      if (success) {
        // Reload user organizations
        const userOrgs = await organizationService.getUserOrganizations(state.user.id);
        if (userOrgs && userOrgs.length > 0) {
          this.stateManager.dispatch({ type: 'SET_USER_ORGANIZATIONS', payload: userOrgs });
          
          const switchedOrg = userOrgs.find(org => org.id === organizationId);
          if (switchedOrg) {
            this.stateManager.dispatch({ type: 'SET_CURRENT_ORGANIZATION', payload: switchedOrg });
            this.stateManager.dispatch({ 
              type: 'SET_ORGANIZATION', 
              payload: {
                id: switchedOrg.id,
                name: switchedOrg.name,
                slug: switchedOrg.slug
              }
            });
          }
        }
      }
      
      return success;
    } catch (error) {
      console.error('Error switching organization:', error);
      return false;
    }
  }
}
