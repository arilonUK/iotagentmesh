
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { profileServices } from '@/services/profileServices';
import { organizationService } from '@/services/profile/organizationService';
import { AuthStateManager, authStateManager } from './AuthStateManager';
import { Profile } from '@/contexts/auth/types';

export class AuthServiceLayer {
  private stateManager: AuthStateManager;
  private retryCount = 0;
  private maxRetries = 3;

  constructor(stateManager: AuthStateManager) {
    this.stateManager = stateManager;
    this.initializeAuthListener();
  }

  private initializeAuthListener(): void {
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      try {
        if (event === 'SIGNED_IN' && session?.user) {
          this.stateManager.dispatch({ type: 'SET_SESSION', payload: session });
          await this.loadUserData(session.user.id);
          this.retryCount = 0; // Reset retry count on successful auth
        } else if (event === 'SIGNED_OUT') {
          this.stateManager.dispatch({ type: 'RESET_AUTH' });
          this.clearUserData();
        } else if (event === 'TOKEN_REFRESHED' && session) {
          this.stateManager.dispatch({ type: 'SET_SESSION', payload: session });
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
        this.handleAuthError(error);
      }
    });
  }

  async initializeSession(): Promise<void> {
    try {
      this.stateManager.dispatch({ type: 'SET_LOADING' });
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      if (session) {
        this.stateManager.dispatch({ type: 'SET_SESSION', payload: session });
        await this.loadUserData(session.user.id);
      } else {
        this.stateManager.dispatch({ type: 'SET_SESSION', payload: null });
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      this.handleAuthError(error);
    }
  }

  private async loadUserData(userId: string): Promise<void> {
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

  private clearUserData(): void {
    organizationService.clearCache();
  }

  private handleAuthError(error: any): void {
    const errorMessage = error instanceof Error ? error.message : 'Authentication error';
    
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`Retrying auth operation (${this.retryCount}/${this.maxRetries})`);
      setTimeout(() => this.initializeSession(), 1000 * this.retryCount);
    } else {
      this.stateManager.dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    }
  }

  async signIn(email: string, password: string) {
    try {
      this.stateManager.dispatch({ type: 'SET_LOADING' });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        this.stateManager.dispatch({ type: 'SET_ERROR', payload: error.message });
        toast.error(`Error signing in: ${error.message}`);
        return { error };
      }

      toast.success('Signed in successfully!');
      return { data };
    } catch (error: any) {
      this.handleAuthError(error);
      return { error };
    }
  }

  async signUp(email: string, password: string, metadata?: any) {
    try {
      this.stateManager.dispatch({ type: 'SET_LOADING' });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) {
        this.stateManager.dispatch({ type: 'SET_ERROR', payload: error.message });
        toast.error(`Error signing up: ${error.message}`);
        return { error };
      }

      toast.success('Account created! Check your email to verify your account.');
      return { data };
    } catch (error: any) {
      this.handleAuthError(error);
      return { error };
    }
  }

  async signOut(): Promise<void> {
    console.log('AuthService: Starting sign out process...');
    
    try {
      this.stateManager.dispatch({ type: 'SET_LOADING' });
      
      // Clear state immediately to provide instant feedback
      this.stateManager.dispatch({ type: 'RESET_AUTH' });
      this.clearUserData();
      
      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('AuthService: Sign out error:', error);
        // Don't throw - we've already cleared local state
      }
      
      // Clear any remaining storage
      try {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
      } catch (storageError) {
        console.warn('AuthService: Error clearing storage:', storageError);
      }
      
      console.log('AuthService: Sign out completed, redirecting...');
      window.location.href = '/auth';
      toast.success('Signed out successfully');
      
    } catch (error: any) {
      console.error('AuthService: Error during sign out:', error);
      
      // Even on error, clear everything and redirect
      this.stateManager.dispatch({ type: 'RESET_AUTH' });
      this.clearUserData();
      
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (storageError) {
        console.warn('AuthService: Error clearing storage during error recovery:', storageError);
      }
      
      window.location.href = '/auth';
      toast.error('Signed out (with errors)');
    }
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
        await this.loadUserData(state.user.id);
      }
      
      return success;
    } catch (error) {
      console.error('Error switching organization:', error);
      return false;
    }
  }
}

export const authService = new AuthServiceLayer(authStateManager);
