
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
import type { OrganizationUser } from '@/hooks/useOrganizationMembers';

interface UserListProps {
  users: OrganizationUser[];
  isCurrentUserOwner: boolean;
  actionInProgress: string | null;
  onRemoveUser: (userId: string) => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  isCurrentUserOwner,
  actionInProgress,
  onRemoveUser
}) => {
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
              onRemoveUser={onRemoveUser}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default UserList;
