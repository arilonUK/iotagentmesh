
import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import UserList from './UserList';
import { useOrganizationMembers } from '@/hooks/useOrganizationMembers';

const UserManagement = () => {
  const { organization, userRole } = useAuth();
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  
  const { 
    users, 
    loading, 
    removeUser,
    updateUserRole
  } = useOrganizationMembers(organization?.id);

  const handleRemoveUser = async (userId: string) => {
    setActionInProgress(userId);
    await removeUser(userId);
    setActionInProgress(null);
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setActionInProgress(userId);
    await updateUserRole(userId, newRole);
    setActionInProgress(null);
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
        actionInProgress={actionInProgress}
        onRemoveUser={handleRemoveUser}
        onUpdateRole={handleUpdateRole}
      />
    </div>
  );
};

export default UserManagement;
