
import { supabase } from '@/integrations/supabase/client';
import { toastService } from '@/services/toastService';

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
        // We need to handle this outside the context
        throw error;
      }

      if (data) {
        // Will be handled by the component
        return;
      }
    } catch (error: any) {
      console.error('Error signing up:', error);
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      console.log(`Attempting to sign in user: ${email}`);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error.message);
        toastService.error("Error", error.message);
        throw error;
      }

      if (data.session) {
        console.log('Sign in successful, redirecting to dashboard');
        toastService.success("Success", "Signed in successfully!");
        // Redirect happens in the component based on session state
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      console.log('Attempting to sign out user');
      // First check if we have a session before attempting to sign out
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        console.log('No active session found, considering user already signed out');
        // Still redirect to auth page even if no active session
        window.location.href = "/auth";
        return;
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error during sign out:', error);
        toastService.error('Error signing out', error.message);
        throw error;
      }
      
      console.log('User signed out successfully');
      toastService.success('Signed out', 'You have been successfully signed out');
      
      // Make sure we redirect to the auth page after signing out
      window.location.href = "/auth";
    } catch (error: any) {
      console.error('Error during sign out process:', error);
      // Don't rethrow the error here - let the app continue even if signout had issues
      // Redirect to auth page regardless of error
      window.location.href = "/auth";
    }
  }
};
