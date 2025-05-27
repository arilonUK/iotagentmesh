
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserOrganization } from '@/contexts/auth/types';

// Simple cache to prevent duplicate requests
const organizationCache = new Map<string, { data: UserOrganization[]; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

// Prevent duplicate concurrent requests
const ongoingRequests = new Map<string, Promise<UserOrganization[]>>();

export const organizationService = {
  getUserOrganizations: async (userId: string): Promise<UserOrganization[]> => {
    if (!userId) {
      console.log('No userId provided, returning empty array');
      return [];
    }

    try {
      console.log('Getting user organizations for user ID:', userId);
      
      // Check cache first
      const cacheKey = `user-orgs-${userId}`;
      const cached = organizationCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('Returning cached organizations');
        return cached.data;
      }

      // Check if there's already an ongoing request for this user
      const ongoingKey = `fetch-${userId}`;
      const existingRequest = ongoingRequests.get(ongoingKey);
      if (existingRequest) {
        console.log('Using existing organization fetch request');
        return existingRequest;
      }

      // Create new request promise
      const requestPromise = this.fetchUserOrganizationsInternal(userId);
      ongoingRequests.set(ongoingKey, requestPromise);

      try {
        const result = await requestPromise;
        
        // Cache the result
        organizationCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
        
        return result;
      } finally {
        // Clean up the ongoing request
        ongoingRequests.delete(ongoingKey);
      }
    } catch (error: any) {
      console.error('Error fetching user organizations:', error);
      return []; // Always return empty array on error
    }
  },

  fetchUserOrganizationsInternal: async (userId: string): Promise<UserOrganization[]> => {
    // Use timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Organization fetch timeout')), 2000); // Reduced to 2 seconds
    });
    
    try {
      const fetchPromise = supabase.rpc('get_user_organizations', { p_user_id: userId });
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (error) {
        console.error('RPC error fetching user organizations:', error);
        
        // For RLS errors, don't throw, just return empty array
        if (error.code === '42P17' || error.message?.includes('infinite recursion')) {
          console.log('RLS recursion detected, returning empty organizations array');
          return [];
        }
        
        throw error;
      }

      const organizations = data as UserOrganization[] || [];
      console.log('Successfully fetched user organizations:', organizations);
      
      return organizations;
    } catch (error: any) {
      console.error('Error in fetchUserOrganizationsInternal:', error);
      
      // For timeout or RLS errors, return empty array
      if (error.message === 'Organization fetch timeout' || 
          error.code === '42P17' || 
          error.message?.includes('infinite recursion')) {
        console.log('Gracefully handling organization fetch failure');
        return [];
      }
      
      // For other errors, still return empty array to prevent blocking auth
      console.error('Unexpected organization fetch error, returning empty array:', error);
      return [];
    }
  },

  switchOrganization: async (userId: string, organizationId: string): Promise<boolean> => {
    if (!userId || !organizationId) {
      console.error('Missing userId or organizationId for switch');
      return false;
    }

    try {
      console.log(`Switching organization to ${organizationId} for user ${userId}`);
      
      // Clear cache when switching
      this.clearCache(userId);
      
      // Use timeout for switch operation
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Switch timeout')), 5000);
      });

      const switchPromise = supabase.rpc('switch_user_organization', {
        p_user_id: userId,
        p_org_id: organizationId
      });

      const { data, error } = await Promise.race([switchPromise, timeoutPromise]);

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
    } catch (error: any) {
      console.error('Error switching organization:', error);
      if (error.message !== 'Switch timeout') {
        toast.error('Error switching organization');
      }
      return false;
    }
  },

  clearCache: (userId?: string) => {
    if (userId) {
      const cacheKey = `user-orgs-${userId}`;
      organizationCache.delete(cacheKey);
      ongoingRequests.delete(`fetch-${userId}`);
    } else {
      organizationCache.clear();
      ongoingRequests.clear();
    }
  }
};
