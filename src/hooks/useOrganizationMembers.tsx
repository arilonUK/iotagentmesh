import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

// Define types
export type OrganizationUser = {
  id: string;
  user_id: string;
  role: string;
  email?: string;
  full_name?: string;
  username?: string;
};

// Define the type for the RPC function response
type OrgMemberResponse = {
  id: string;
  user_id: string;
  role: string;
  username: string;
  full_name: string;
  email: string;
};

export const useOrganizationMembers = (organizationId?: string) => {
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrganizationUsers = async () => {
    if (!organizationId) return;
    
    setLoading(true);
    try {
      // Fix: Provide explicit type parameters for rpc call - both return type and function name
      const { data, error } = await supabase.rpc<OrgMemberResponse[], 'get_organization_members'>(
        'get_organization_members', 
        { p_org_id: organizationId }
      );
      
      if (error) {
        console.error('Error fetching organization members:', error);
        
        // Try fallback method if RPC fails
        await fetchOrganizationUsersFallback();
        return;
      }
      
      if (data && Array.isArray(data)) {
        console.log('Fetched organization members:', data);
        // Map the response to OrganizationUser type
        const mappedUsers: OrganizationUser[] = data.map(member => ({
          id: member.id,
          user_id: member.user_id,
          role: member.role,
          email: member.email,
          full_name: member.full_name,
          username: member.username
        }));
        setUsers(mappedUsers);
      } else {
        console.log('No members found or invalid data format');
        setUsers([]);
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error in fetchOrganizationUsers:', error);
      setError(error);
      
      // Try fallback method
      await fetchOrganizationUsersFallback();
    } finally {
      setLoading(false);
    }
  };
  
  // Fallback method using separate queries to avoid RLS recursion
  const fetchOrganizationUsersFallback = async () => {
    if (!organizationId) return;
    
    try {
      console.log('Using fallback method to fetch organization members');
      
      // First get user IDs with roles from a direct query or custom function
      const { data: rawMembers, error: membersError } = await supabase
        .from('organization_members')
        .select('id, user_id, role')
        .eq('organization_id', organizationId);
      
      if (membersError) {
        console.error('Fallback error fetching members:', membersError);
        toast('Error loading team members', { 
          style: { backgroundColor: 'red', color: 'white' } 
        });
        return;
      }
      
      if (!rawMembers || rawMembers.length === 0) {
        console.log('No members found');
        setUsers([]);
        return;
      }
      
      // For each member, fetch profile info
      const usersWithProfiles = await Promise.all(
        rawMembers.map(async (member) => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, username')
              .eq('id', member.user_id)
              .maybeSingle();
            
            return {
              ...member,
              email: profile?.username, // Username might be email
              full_name: profile?.full_name,
              username: profile?.username
            };
          } catch (profileError) {
            console.error('Error fetching profile:', profileError);
            return member;
          }
        })
      );
      
      setUsers(usersWithProfiles);
    } catch (error) {
      console.error('Error in fallback method:', error);
      toast('Error loading team members', {
        style: { backgroundColor: 'red', color: 'white' }
      });
      setUsers([]);
    }
  };

  // Function to remove a user from the organization
  const removeUser = async (userId: string) => {
    if (!organizationId) return;
    
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('organization_id', organizationId)
        .eq('user_id', userId);

      if (error) {
        toast('Error removing user', { 
          style: { backgroundColor: 'red', color: 'white' } 
        });
        return;
      }

      toast('User removed successfully', {
        style: { backgroundColor: 'green', color: 'white' }
      });
      
      // Update the user list
      setUsers(users.filter(user => user.user_id !== userId));
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };

  // Function to update a user's role
  const updateUserRole = async (userId: string, newRole: string) => {
    if (!organizationId) return;
    
    try {
      // Fix: Cast newRole to the correct enum type to match database constraint
      const validRole = newRole as Database["public"]["Enums"]["role_type"];
      
      const { error } = await supabase
        .from('organization_members')
        .update({ role: validRole })
        .eq('organization_id', organizationId)
        .eq('user_id', userId);

      if (error) {
        toast('Error updating role', { 
          style: { backgroundColor: 'red', color: 'white' } 
        });
        return;
      }

      toast('Role updated successfully', {
        style: { backgroundColor: 'green', color: 'white' }
      });
      
      // Update the user list
      setUsers(users.map(user => 
        user.user_id === userId ? { ...user, role: validRole } : user
      ));
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchOrganizationUsers();
    }
  }, [organizationId]);

  return { 
    users, 
    loading, 
    error, 
    removeUser, 
    updateUserRole,
    refreshUsers: fetchOrganizationUsers
  };
};
