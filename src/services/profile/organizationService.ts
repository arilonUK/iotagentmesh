
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserOrganization } from '@/contexts/auth/types';

export const organizationService = {
  getUserOrganizations: async (userId: string): Promise<UserOrganization[]> => {
    try {
      console.log('Getting user organizations for user ID:', userId);
      
      // Use the RPC method which should now work with fixed RLS policies
      const { data, error } = await supabase
        .rpc('get_user_organizations', { p_user_id: userId });

      if (error) {
        console.error('Error fetching user organizations with RPC:', error);
        throw error;
      }

      if (data && data.length > 0) {
        console.log('Successfully fetched user organizations with RPC:', data);
        return data as UserOrganization[];
      } else {
        console.log('No organizations found for user with RPC method');
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching user organizations:', error);
      // Don't fall back to problematic methods that cause infinite recursion
      // Instead, return empty array and let the app continue
      toast.error('Unable to load organizations. Please refresh the page.');
      return [];
    }
  },

  switchOrganization: async (userId: string, organizationId: string): Promise<boolean> => {
    try {
      console.log(`Switching organization to ${organizationId} for user ${userId} using RPC`);
      const { data, error } = await supabase
        .rpc('switch_user_organization', {
          p_user_id: userId,
          p_org_id: organizationId
        });

      if (error) {
        console.error('Error switching organization with RPC:', error);
        toast.error('Error switching organization');
        return false;
      }

      if (data) {
        toast.success('Organization switched successfully');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error switching organization:', error);
      toast.error('Error switching organization');
      return false;
    }
  }
};
