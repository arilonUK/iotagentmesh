
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrganizationUser } from '@/types/organization';
import {
  fetchOrganizationMembers,
  removeOrganizationMember,
  updateOrganizationMemberRole
} from '@/services/organizationMemberService';
import { toast } from 'sonner';

/**
 * Hook for managing organization members using React Query
 */
export const useOrganizationMembers = (organizationId?: string) => {
  const queryClient = useQueryClient();
  
  // Query for fetching organization members
  const {
    data: users = [],
    isLoading: loading,
    error,
    refetch: refreshUsers
  } = useQuery({
    queryKey: ['organizationMembers', organizationId],
    queryFn: () => fetchOrganizationMembers(organizationId || ''),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
  
  // Mutation for removing users
  const removeUserMutation = useMutation({
    mutationFn: ({ orgId, userId }: { orgId: string; userId: string }) => 
      removeOrganizationMember(orgId, userId),
    onSuccess: (success, { userId }) => {
      if (success) {
        // Optimistically update the UI
        queryClient.setQueryData(
          ['organizationMembers', organizationId], 
          (oldData: OrganizationUser[] | undefined) => 
            oldData ? oldData.filter(user => user.user_id !== userId) : []
        );
        toast.success('User removed successfully');
      }
    },
    onError: () => {
      toast.error('Error removing user');
      // Refetch the data on error to ensure UI is in sync
      refreshUsers();
    }
  });
  
  // Mutation for updating user roles
  const updateUserRoleMutation = useMutation({
    mutationFn: ({ orgId, userId, newRole }: { orgId: string; userId: string; newRole: string }) => 
      updateOrganizationMemberRole(orgId, userId, newRole),
    onSuccess: (success, { userId, newRole }) => {
      if (success) {
        // Optimistically update the UI
        queryClient.setQueryData(
          ['organizationMembers', organizationId], 
          (oldData: OrganizationUser[] | undefined) => {
            if (!oldData) return [];
            return oldData.map(user => 
              user.user_id === userId ? { ...user, role: newRole } : user
            );
          }
        );
        toast.success('Role updated successfully');
      }
    },
    onError: () => {
      toast.error('Error updating role');
      // Refetch the data on error to ensure UI is in sync
      refreshUsers();
    }
  });
  
  // Wrapper functions to simplify usage
  const removeUser = (userId: string) => {
    if (!organizationId) return;
    return removeUserMutation.mutate({ orgId: organizationId, userId });
  };
  
  const updateUserRole = (userId: string, newRole: string) => {
    if (!organizationId) return;
    return updateUserRoleMutation.mutate({ orgId: organizationId, userId, newRole });
  };

  return { 
    users, 
    loading, 
    error, 
    removeUser, 
    updateUserRole,
    refreshUsers,
    isRemovingUser: removeUserMutation.isPending,
    isUpdatingRole: updateUserRoleMutation.isPending
  };
};
