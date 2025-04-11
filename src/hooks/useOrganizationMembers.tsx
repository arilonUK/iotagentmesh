
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { OrganizationUser } from '@/types/organization';
import {
  fetchOrganizationUsers,
  removeUserFromOrganization,
  updateUserRoleInOrganization
} from '@/services/organizationMembersService';

export const useOrganizationMembers = (organizationId?: string) => {
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMembers = async () => {
    if (!organizationId) return;
    
    setLoading(true);
    try {
      const fetchedUsers = await fetchOrganizationUsers(organizationId);
      setUsers(fetchedUsers);
      setError(null);
    } catch (err) {
      const error = err as Error;
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  // Function to remove a user from the organization
  const removeUser = async (userId: string) => {
    if (!organizationId) return;
    
    const success = await removeUserFromOrganization(organizationId, userId);
    if (success) {
      // Update the user list
      setUsers(users.filter(user => user.user_id !== userId));
    }
  };

  // Function to update a user's role
  const updateUserRole = async (userId: string, newRole: string) => {
    if (!organizationId) return;
    
    const success = await updateUserRoleInOrganization(organizationId, userId, newRole);
    if (success) {
      // Update the user list
      setUsers(users.map(user => 
        user.user_id === userId ? { ...user, role: newRole } : user
      ));
    }
  };

  useEffect(() => {
    if (organizationId) {
      loadMembers();
    }
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

export type { OrganizationUser } from '@/types/organization';
