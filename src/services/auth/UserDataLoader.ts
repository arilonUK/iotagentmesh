
import { organizationService } from '@/services/profile/organizationService';
import { AuthStateManager } from './AuthStateManager';

export class UserDataLoader {
  private stateManager: AuthStateManager;

  constructor(stateManager: AuthStateManager) {
    this.stateManager = stateManager;
  }

  async loadUserData(userId: string): Promise<void> {
    try {
      // Load organizations in background
      setTimeout(async () => {
        try {
          const userOrgs = await organizationService.getUserOrganizations(userId);
          if (userOrgs && userOrgs.length > 0) {
            this.stateManager.dispatch({ type: 'SET_USER_ORGANIZATIONS', payload: userOrgs });
            
            const defaultOrg = userOrgs.find(org => org.is_default) || userOrgs[0];
            if (defaultOrg) {
              this.stateManager.dispatch({ type: 'SET_CURRENT_ORGANIZATION', payload: defaultOrg });
              this.stateManager.dispatch({ 
                type: 'SET_ORGANIZATION', 
                payload: {
                  id: defaultOrg.id,
                  name: defaultOrg.name,
                  slug: defaultOrg.slug
                }
              });
            }
          }
        } catch (error) {
          console.error('Error loading organizations:', error);
        }
      }, 100);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  clearUserData(): void {
    organizationService.clearCache();
  }
}
