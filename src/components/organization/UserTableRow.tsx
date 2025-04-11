
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { roleColors } from '@/lib/utils';
import RemoveUserDialog from './RemoveUserDialog';
import type { OrganizationUser } from '@/hooks/useOrganizationMembers';
import { Database } from '@/integrations/supabase/types';

interface UserTableRowProps {
  user: OrganizationUser;
  isCurrentUserOwner: boolean;
  isActionInProgress: boolean;
  onRemoveUser: (userId: string) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  isCurrentUserOwner,
  isActionInProgress,
  onRemoveUser
}) => {
  const displayName = user.full_name || user.username || user.email || 'Unknown User';
  
  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>{displayName}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge 
          variant="outline" 
          className={`${roleColors[user.role as keyof typeof roleColors] || ''} text-white`}
        >
          {user.role}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          {isCurrentUserOwner && user.role !== 'owner' && (
            <RemoveUserDialog
              userName={displayName}
              isDisabled={isActionInProgress}
              onRemove={() => onRemoveUser(user.user_id)}
            />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default UserTableRow;
