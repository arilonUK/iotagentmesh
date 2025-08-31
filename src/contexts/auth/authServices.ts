
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserMetadata } from './types';

/**
 * Authentication services
 */
export const authServices = {
  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error(`Error signing in: ${error.message}`);
        return { error };
      }

      toast.success('Signed in successfully!');
      return { data };
    } catch (error: unknown) {
      console.error('Error signing in:', error);
      return { error: error as Error };
    }
  },

  /**
   * Sign up with email and password
   */
  signUp: async (email: string, password: string, metadata?: UserMetadata) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) {
        toast.error(`Error signing up: ${error.message}`);
        return { error };
      }

      toast.success('Account created! Check your email to verify your account.');
      return { data };
    } catch (error: unknown) {
      console.error('Error signing up:', error);
      return { error: error as Error };
    }
  },

  /**
   * Sign out current user with improved error handling
   */
  signOut: async () => {
    console.log('AuthServices: Starting sign out process...');
    
    try {
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Sign out timeout')), 10000); // 10 second timeout
      });

      // Race between signOut and timeout
      const signOutPromise = supabase.auth.signOut();
      
      const { error } = await Promise.race([signOutPromise, timeoutPromise]) as { error?: Error };
      
      if (error) {
        console.error('AuthServices: Supabase sign out error:', error);
        // Don't throw error, just log it and continue with cleanup
      }

      console.log('AuthServices: Supabase sign out completed');
      
      // Clear any local storage items
      try {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
      } catch (storageError) {
        console.warn('AuthServices: Error clearing storage:', storageError);
      }
      
      console.log('AuthServices: Storage cleared, redirecting...');
      
      // Force redirect to auth page
      window.location.href = '/auth';
      
      toast.success('Signed out successfully');
      return { data: { success: true } };
    } catch (error: unknown) {
      console.error('AuthServices: Error during sign out:', error);
      
      // Even if there's an error, clear storage and redirect
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (storageError) {
        console.warn('AuthServices: Error clearing storage during error recovery:', storageError);
      }
      
      // Force redirect even if there's an error
      console.log('AuthServices: Forcing redirect due to error');
      window.location.href = '/auth';
      
      toast.error('Signed out (with errors)');
      return { error };
    }
  }
};
