
import { AuthStateManager, authStateManager } from './AuthStateManager';
import { AuthListener } from './AuthListener';
import { UserDataLoader } from './UserDataLoader';
import { AuthenticationService } from './AuthenticationService';
import { ProfileService } from './ProfileService';

export class AuthServiceLayer {
  private stateManager: AuthStateManager;
  private userDataLoader: UserDataLoader;
  private authListener: AuthListener;
  private authenticationService: AuthenticationService;
  private profileService: ProfileService;

  constructor(stateManager: AuthStateManager) {
    this.stateManager = stateManager;
    this.userDataLoader = new UserDataLoader(stateManager);
    this.authListener = new AuthListener(stateManager, this.userDataLoader);
    this.authenticationService = new AuthenticationService(stateManager);
    this.profileService = new ProfileService(stateManager);
  }

  async initializeSession(): Promise<void> {
    return this.authListener.initializeSession();
  }

  async signIn(email: string, password: string) {
    return this.authenticationService.signIn(email, password);
  }

  async signUp(email: string, password: string, metadata?: any) {
    return this.authenticationService.signUp(email, password, metadata);
  }

  async signOut(): Promise<void> {
    return this.authenticationService.signOut();
  }

  async updateProfile(profileData: any) {
    return this.profileService.updateProfile(profileData);
  }

  async switchOrganization(organizationId: string): Promise<boolean> {
    return this.profileService.switchOrganization(organizationId);
  }
}

export const authService = new AuthServiceLayer(authStateManager);
