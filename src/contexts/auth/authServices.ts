
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
    } catch (error: any) {
      console.error('Error signing in:', error);
      return { error };
    }
  },

  /**
   * Sign up with email and password
   */
  signUp: async (email: string, password: string, metadata?: any) => {
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
    } catch (error: any) {
      console.error('Error signing up:', error);
      return { error };
    }
  },

  /**
   * Sign out current user
   */
  signOut: async () => {
    try {
      console.log('Starting sign out process...');
      
      // Clear the session from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase sign out error:', error);
        toast.error(`Error signing out: ${error.message}`);
        return { error };
      }

      console.log('Supabase sign out successful');
      
      // Clear any local storage items
      localStorage.removeItem('supabase.auth.token');
      
      // Force redirect to auth page
      window.location.href = '/auth';
      
      toast.success('Signed out successfully');
      return { data: { success: true } };
    } catch (error: any) {
      console.error('Error during sign out:', error);
      toast.error(`Error signing out: ${error.message}`);
      
      // Force redirect even if there's an error
      window.location.href = '/auth';
      return { error };
    }
  }
};
