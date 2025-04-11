
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const authServices = {
  signUp: async (email: string, password: string, userData?: { full_name?: string; username?: string; organization_name?: string }) => {
    try {
      // If organization_name is provided, we'll create an organization and make the user an admin
      const organization_name = userData?.organization_name;
      const full_name = userData?.full_name;
      const username = userData?.username;

      // Create a slug from organization name if provided
      let organization_slug = '';
      if (organization_name) {
        // Create a URL-friendly slug from the organization name
        organization_slug = organization_name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            username,
            organization_name,
            organization_slug
          },
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
