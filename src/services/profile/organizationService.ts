
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserOrganization } from '@/contexts/auth/types';

// Simple cache to prevent duplicate requests
const organizationCache = new Map<string, { data: UserOrganization[]; timestamp: number }>();
const CACHE_DURATION = 60000; // Increase to 60 seconds for more stability

// Prevent duplicate concurrent requests
const ongoingRequests = new Map<string, Promise<UserOrganization[]>>();

const fetchUserOrganizationsInternal = async (userId: string): Promise<UserOrganization[]> => {
  console.log('fetchUserOrganizationsInternal called for user:', userId);
  
  // Increase timeout to 10 seconds for better reliability
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Organization fetch timeout')), 10000);
  });
  
  try {
    // Try the RPC function first
    const fetchPromise = supabase.rpc('get_user_organizations', { p_user_id: userId });
    
    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

    if (error) {
      console.error('RPC error fetching user organizations:', error);
      
      // For RLS errors or function not found, try direct query approach
      if (error.code === '42P17' || error.message?.includes('infinite recursion') || error.message?.includes('Function not found')) {
        console.log('RPC failed, trying direct query approach');
        
        // Fallback: try to get organizations directly from organization_members table
        const { data: memberData, error: memberError } = await supabase
          .from('organization_members')
          .select(`
            role,
            organizations!inner (
              id,
              name,
              slug
            )
          `)
          .eq('user_id', userId);

        if (memberError) {
          console.error('Direct query also failed:', memberError);
          throw memberError;
        }

        if (memberData && memberData.length > 0) {
          const organizations = memberData.map((member: Record<string, unknown>) => {
            const org = member.organizations as { id: string; name: string; slug: string };
            return {
              id: org.id,
              name: org.name,
              slug: org.slug,
              role: member.role as string,
              is_default: false
            };
          });
          
          // Mark the first one as default
          if (organizations.length > 0) {
            organizations[0].is_default = true;
          }
          
          console.log('Successfully fetched organizations via direct query:', organizations);
          return organizations;
        }
        
        return [];
      }
      
      throw error;
    }

    const organizations = data as UserOrganization[] || [];
    console.log('Successfully fetched user organizations via RPC:', organizations);
    
    return organizations;
  } catch (error: unknown) {
    console.error('Error in fetchUserOrganizationsInternal:', error);
    
    // For any error, try to ensure user has a valid organization using our new RPC function
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage === 'Organization fetch timeout' || 
        errorMessage.includes('fetch') ||
        errorMessage.includes('invalid') ||
        errorMessage.includes('uuid')) {
      console.log('Ensuring user has valid organization due to error:', errorMessage);
      
      try {
        // Use the new RPC function to ensure user has a valid organization
        const { data: orgId, error: orgError } = await supabase.rpc('get_user_organization_id', { p_user_id: userId });
        
        if (!orgError && orgId) {
          // Now fetch the organization details
          const { data: orgData, error: fetchError } = await supabase
            .from('organizations')
            .select('id, name, slug')
            .eq('id', orgId)
            .single();
            
          if (!fetchError && orgData) {
            const organization: UserOrganization = {
              id: orgData.id,
              name: orgData.name,
              slug: orgData.slug,
              role: 'owner',
              is_default: true
            };
            return [organization];
          }
        }
      } catch (ensureError) {
        console.error('Error ensuring valid organization:', ensureError);
      }
    }
    
    // For other errors, return empty array to allow retry
    console.error('Unexpected organization fetch error:', error);
    return [];
  }
};

const clearCache = (userId?: string) => {
  if (userId) {
    const cacheKey = `user-orgs-${userId}`;
    organizationCache.delete(cacheKey);
    ongoingRequests.delete(`fetch-${userId}`);
  } else {
    organizationCache.clear();
    ongoingRequests.clear();
  }
};

export const organizationService = {
  getUserOrganizations: async (userId: string): Promise<UserOrganization[]> => {
    if (!userId) {
      console.log('No userId provided, returning empty array');
      return [];
    }

    try {
      console.log('Getting user organizations for user ID:', userId);
      
      // Check cache first with shorter duration to allow more frequent updates
      const cacheKey = `user-orgs-${userId}`;
      const cached = organizationCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('Returning cached organizations:', cached.data);
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
      const requestPromise = fetchUserOrganizationsInternal(userId);
      ongoingRequests.set(ongoingKey, requestPromise);

      try {
        const result = await requestPromise;
        
        // Cache successful results with valid UUID organizations
        if (result.length > 0) {
          organizationCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
          });
        }
        
        console.log('Final organizations result:', result);
        return result;
      } finally {
        // Clean up the ongoing request
        ongoingRequests.delete(ongoingKey);
      }
    } catch (error: unknown) {
      console.error('Error fetching user organizations:', error);
      // Return empty array instead of fallback to allow retry
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
      clearCache(userId);
      
      // Use timeout for switch operation
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Switch timeout')), 8000);
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
    } catch (error: unknown) {
      console.error('Error switching organization:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage !== 'Switch timeout') {
        toast.error('Error switching organization');
      }
      return false;
    }
  },

  clearCache
};
