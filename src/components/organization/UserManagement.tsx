
import React from 'react';
import { useAuth } from '@/contexts/auth';
import UserList from './UserList';
import { useOrganizationMembers } from '@/hooks/useOrganizationMembers';

const UserManagement = () => {
  const { organization, userRole } = useAuth();
  
  const { 
    users, 
    loading, 
    removeUser,
    updateUserRole,
    isRemovingUser,
    isUpdatingRole
  } = useOrganizationMembers(organization?.id);

  const handleRemoveUser = async (userId: string) => {
    await removeUser(userId);
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    await updateUserRole(userId, newRole);
  };

  // Only show to admins and owners
  if (!organization || (userRole !== 'admin' && userRole !== 'owner')) {
    return (
      <div className="text-center py-6">
        You don't have permission to access user management.
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-6">Loading users...</div>;
  }

  return (
    <div>
      <UserList 
        users={users}
        isCurrentUserOwner={userRole === 'owner'}
        actionInProgress={isRemovingUser || isUpdatingRole ? 'loading' : null}
        onRemoveUser={handleRemoveUser}
        onUpdateRole={handleUpdateRole}
      />
    </div>
  );
};

export default UserManagement;
