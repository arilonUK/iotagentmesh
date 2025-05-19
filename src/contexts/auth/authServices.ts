
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
      return undefined;
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
      return undefined;
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
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(`Error signing out: ${error.message}`);
      } else {
        toast.success('Signed out successfully');
      }
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error(`Error signing out: ${error.message}`);
    }
  }
};
