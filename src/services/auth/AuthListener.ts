
import { supabase } from '@/integrations/supabase/client';
import { AuthStateManager } from './AuthStateManager';
import { UserDataLoader } from './UserDataLoader';

export class AuthListener {
  private stateManager: AuthStateManager;
  private userDataLoader: UserDataLoader;
  private retryCount = 0;
  private maxRetries = 3;

  constructor(stateManager: AuthStateManager, userDataLoader: UserDataLoader) {
    this.stateManager = stateManager;
    this.userDataLoader = userDataLoader;
    this.initializeAuthListener();
  }

  private initializeAuthListener(): void {
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      try {
        if (event === 'SIGNED_IN' && session?.user) {
          this.stateManager.dispatch({ type: 'SET_SESSION', payload: session });
          await this.userDataLoader.loadUserData(session.user.id);
          this.retryCount = 0; // Reset retry count on successful auth
        } else if (event === 'SIGNED_OUT') {
          this.stateManager.dispatch({ type: 'RESET_AUTH' });
          this.userDataLoader.clearUserData();
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
        await this.userDataLoader.loadUserData(session.user.id);
      } else {
        this.stateManager.dispatch({ type: 'SET_SESSION', payload: null });
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      this.handleAuthError(error);
    }
  }

  private handleAuthError(error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : 'Authentication error';
    
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`Retrying auth operation (${this.retryCount}/${this.maxRetries})`);
      setTimeout(() => this.initializeSession(), 1000 * this.retryCount);
    } else {
      this.stateManager.dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }
}
