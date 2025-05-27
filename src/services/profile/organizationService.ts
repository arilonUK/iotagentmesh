
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserOrganization } from '@/contexts/auth/types';

// Cache to prevent duplicate requests
const fetchCache = new Map<string, Promise<UserOrganization[]>>();

export const organizationService = {
  getUserOrganizations: async (userId: string): Promise<UserOrganization[]> => {
    try {
      console.log('Getting user organizations for user ID:', userId);
      
      // Check cache first to prevent duplicate requests
      const cacheKey = `user-orgs-${userId}`;
      if (fetchCache.has(cacheKey)) {
        console.log('Returning cached organization request');
        return await fetchCache.get(cacheKey)!;
      }
      
      // Create the promise and cache it
      const fetchPromise = (async () => {
        try {
          // Set a timeout for the RPC call
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Organization fetch timeout')), 3000); // Reduced to 3 seconds
          });

          const rpcPromise = supabase
            .rpc('get_user_organizations', { p_user_id: userId });

          const { data, error } = await Promise.race([rpcPromise, timeoutPromise]);

          if (error) {
            console.error('Error fetching user organizations with RPC:', error);
            
            // If it's an RLS infinite recursion error, return empty array to allow auth to continue
            if (error.message?.includes('infinite recursion') || error.code === '42P17') {
              console.log('RLS infinite recursion detected, returning empty organizations array');
              return [];
            }
            
            throw error;
          }

          if (data && data.length > 0) {
            console.log('Successfully fetched user organizations with RPC:', data);
            return data as UserOrganization[];
          } else {
            console.log('No organizations found for user with RPC method');
            return [];
          }
        } finally {
          // Clear cache after request completes
          setTimeout(() => {
            fetchCache.delete(cacheKey);
          }, 1000);
        }
      })();
      
      // Cache the promise
      fetchCache.set(cacheKey, fetchPromise);
      
      return await fetchPromise;
    } catch (error: any) {
      console.error('Error fetching user organizations:', error);
      
      // Clear cache on error
      fetchCache.delete(`user-orgs-${userId}`);
      
      // Don't show error toast for RLS issues or timeouts, just log and continue
      if (!error.message?.includes('infinite recursion') && 
          !error.message?.includes('timeout') && 
          error.code !== '42P17') {
        toast.error('Unable to load organizations. Using basic authentication.');
      }
      
      return [];
    }
  },

  switchOrganization: async (userId: string, organizationId: string): Promise<boolean> => {
    try {
      console.log(`Switching organization to ${organizationId} for user ${userId} using RPC`);
      
      // Clear any cached data when switching
      fetchCache.delete(`user-orgs-${userId}`);
      
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
