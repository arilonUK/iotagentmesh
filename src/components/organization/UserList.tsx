
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import UserTableRow from './UserTableRow';
import type { OrganizationUser } from '@/types/organization';
import { useAuth } from '@/contexts/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface UserListProps {
  users: OrganizationUser[];
  isCurrentUserOwner: boolean;
  actionInProgress: string | null;
  onRemoveUser: (userId: string) => void;
  onUpdateRole?: (userId: string, newRole: string) => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  isCurrentUserOwner,
  actionInProgress,
  onRemoveUser,
  onUpdateRole
}) => {
  const { user, userRole } = useAuth();
  const currentUserId = user?.id || '';
  
  // Check permissions
  const canManageTeam = hasPermission(userRole, PERMISSIONS.MANAGE_TEAM);
  
  if (!canManageTeam && users.length > 0) {
    return (
      <Alert className="mb-6">
        <Shield className="h-4 w-4" />
        <AlertTitle>Permission required</AlertTitle>
        <AlertDescription>
          You need admin or owner permissions to manage team members.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="text-center py-4">
              No team members found
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
            <UserTableRow
              key={user.id}
              user={user}
              isCurrentUserOwner={isCurrentUserOwner}
              isActionInProgress={actionInProgress === user.user_id}
              currentUserId={currentUserId}
              userRole={userRole}
              onRemoveUser={onRemoveUser}
              onUpdateRole={onUpdateRole}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default UserList;
