
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserOrganization } from '@/contexts/auth/types';

// Simple cache to prevent duplicate requests
const organizationCache = new Map<string, { data: UserOrganization[]; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

export const organizationService = {
  getUserOrganizations: async (userId: string): Promise<UserOrganization[]> => {
    try {
      console.log('Getting user organizations for user ID:', userId);
      
      // Check cache first
      const cacheKey = `user-orgs-${userId}`;
      const cached = organizationCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('Returning cached organizations');
        return cached.data;
      }
      
      // Use the RLS bypass function with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Organization fetch timeout')), 3000); // Reduced timeout
      });
      
      const fetchPromise = supabase.rpc('get_user_organizations', { p_user_id: userId });
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error fetching user organizations:', error);
        // Don't throw on RLS errors, return empty array instead
        if (error.code === '42P17') {
          console.log('RLS recursion detected, returning empty organizations array');
          return [];
        }
        throw error;
      }

      const organizations = data as UserOrganization[] || [];
      console.log('Successfully fetched user organizations:', organizations);
      
      // Cache the result
      organizationCache.set(cacheKey, {
        data: organizations,
        timestamp: Date.now()
      });
      
      return organizations;
    } catch (error: any) {
      console.error('Error fetching user organizations:', error);
      
      // For timeout or RLS errors, don't show toast and return empty array
      if (error.message === 'Organization fetch timeout' || error.code === '42P17') {
        console.log('Gracefully handling organization fetch failure');
        return [];
      }
      
      // Only show error for unexpected errors
      console.error('Unexpected organization fetch error:', error);
      return [];
    }
  },

  switchOrganization: async (userId: string, organizationId: string): Promise<boolean> => {
    try {
      console.log(`Switching organization to ${organizationId} for user ${userId}`);
      
      // Clear cache when switching
      organizationCache.delete(`user-orgs-${userId}`);
      
      const { data, error } = await supabase
        .rpc('switch_user_organization', {
          p_user_id: userId,
          p_org_id: organizationId
        });

      if (error) {
        console.error('Error switching organization:', error);
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
  },

  clearCache: (userId?: string) => {
    if (userId) {
      organizationCache.delete(`user-orgs-${userId}`);
    } else {
      organizationCache.clear();
    }
  }
};
