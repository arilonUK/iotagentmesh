
import { useEffect, useState } from 'react';
import { OrganizationUser } from '@/types/organization';
import {
  fetchOrganizationMembers,
  removeOrganizationMember,
  updateOrganizationMemberRole
} from '@/services/organizationMemberService';

/**
 * Hook for managing organization members
 */
export const useOrganizationMembers = (organizationId?: string) => {
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load all members of the organization
  const loadMembers = async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const fetchedUsers = await fetchOrganizationMembers(organizationId);
      setUsers(fetchedUsers);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  // Remove a user from the organization
  const removeUser = async (userId: string) => {
    if (!organizationId) return;
    
    const success = await removeOrganizationMember(organizationId, userId);
    if (success) {
      // Update the local state
      setUsers(users.filter(user => user.user_id !== userId));
    }
  };

  // Update a user's role
  const updateUserRole = async (userId: string, newRole: string) => {
    if (!organizationId) return;
    
    const success = await updateOrganizationMemberRole(organizationId, userId, newRole);
    if (success) {
      // Update the local state
      setUsers(users.map(user => 
        user.user_id === userId ? { ...user, role: newRole } : user
      ));
    }
  };

  // Load members when the component mounts or organizationId changes
  useEffect(() => {
    loadMembers();
  }, [organizationId]);

  return { 
    users, 
    loading, 
    error, 
    removeUser, 
    updateUserRole,
    refreshUsers: loadMembers
  };
};
