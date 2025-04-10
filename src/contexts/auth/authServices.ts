
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const authServices = {
  signUp: async (email: string, password: string, userData?: { full_name?: string; username?: string; organization_name?: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        toast(error.message, { 
          style: { backgroundColor: 'red', color: 'white' } 
        });
        throw error;
      }

      if (data) {
        toast('Sign up successful! Please verify your email.', {
          style: { backgroundColor: 'green', color: 'white' }
        });
        return;
      }
    } catch (error: any) {
      console.error('Error signing up:', error);
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast(error.message, { 
          style: { backgroundColor: 'red', color: 'white' } 
        });
        throw error;
      }

      if (data.session) {
        toast('Signed in successfully!', {
          style: { backgroundColor: 'green', color: 'white' }
        });
        return data;
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast('Error signing out', { 
          style: { backgroundColor: 'red', color: 'white' } 
        });
        throw error;
      }
      toast('Signed out successfully', {
        style: { backgroundColor: 'green', color: 'white' }
      });
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw error;
    }
  }
};
