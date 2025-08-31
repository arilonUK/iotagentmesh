
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AuthStateManager } from './AuthStateManager';

export class AuthenticationService {
  private stateManager: AuthStateManager;

  constructor(stateManager: AuthStateManager) {
    this.stateManager = stateManager;
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication error';
      this.stateManager.dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { error };
    }
  }

  async signUp(email: string, password: string, metadata?: Record<string, unknown>) {
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication error';
      this.stateManager.dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { error };
    }
  }

  async signOut(): Promise<void> {
    console.log('AuthenticationService: Starting sign out process...');
    
    try {
      this.stateManager.dispatch({ type: 'SET_LOADING' });
      
      // Clear state immediately to provide instant feedback
      this.stateManager.dispatch({ type: 'RESET_AUTH' });
      
      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('AuthenticationService: Sign out error:', error);
        // Don't throw - we've already cleared local state
      }
      
      // Clear any remaining storage
      try {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
      } catch (storageError) {
        console.warn('AuthenticationService: Error clearing storage:', storageError);
      }
      
      console.log('AuthenticationService: Sign out completed, redirecting...');
      window.location.href = '/auth';
      toast.success('Signed out successfully');
      
    } catch (error: unknown) {
      console.error('AuthenticationService: Error during sign out:', error);
      
      // Even on error, clear everything and redirect
      this.stateManager.dispatch({ type: 'RESET_AUTH' });
      
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (storageError) {
        console.warn('AuthenticationService: Error clearing storage during error recovery:', storageError);
      }
      
      window.location.href = '/auth';
      toast.error('Signed out (with errors)');
    }
  }
}
