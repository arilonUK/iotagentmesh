
import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import UserList from './UserList';
import { useOrganizationMembers } from '@/hooks/useOrganizationMembers';
import { Button } from '@/components/ui/button';
import { RefreshCw, Shield, Info } from 'lucide-react';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const UserManagement = () => {
  const { organization, userRole, user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    users, 
    loading, 
    removeUser,
    updateUserRole,
    isRemovingUser,
    isUpdatingRole,
    refreshUsers
  } = useOrganizationMembers(organization?.id);

  // Check if current user has permission to view this component
  const canViewTeam = hasPermission(userRole, PERMISSIONS.MANAGE_TEAM);
  const isCurrentUserOwner = userRole === 'owner';
  const isFallbackOrg = organization?.id?.startsWith('default-org-');

  const handleRemoveUser = async (userId: string) => {
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_TEAM)) return;
    await removeUser(userId);
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!hasPermission(userRole, PERMISSIONS.MANAGE_TEAM)) return;
    await updateUserRole(userId, newRole);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshUsers();
    setIsRefreshing(false);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="text-center py-8 space-y-2">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Loading team members...</p>
      </div>
    );
  }

  // Show permission check
  if (!organization || !canViewTeam) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-500" />
            <span>Permission Required</span>
          </CardTitle>
          <CardDescription>
            You don't have permission to access team management.
            Contact an organization owner or administrator for access.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Team Members ({users.length})</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </Button>
      </div>

      {isFallbackOrg && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Demo Organization</AlertTitle>
          <AlertDescription>
            You're viewing a demo organization. Create a real organization to invite team members and manage roles.
          </AlertDescription>
        </Alert>
      )}

      {!isCurrentUserOwner && !isFallbackOrg && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Note</AlertTitle>
          <AlertDescription>
            Only organization owners can change other admin roles or remove admins.
          </AlertDescription>
        </Alert>
      )}

      <UserList 
        users={users}
        isCurrentUserOwner={isCurrentUserOwner}
        actionInProgress={isRemovingUser || isUpdatingRole ? 'loading' : null}
        onRemoveUser={handleRemoveUser}
        onUpdateRole={handleUpdateRole}
      />
    </div>
  );
};

export default UserManagement;
