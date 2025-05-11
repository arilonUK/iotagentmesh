
import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { User, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { roleColors } from '@/lib/utils';
import RemoveUserDialog from './RemoveUserDialog';
import { OrganizationUser } from '@/types/organization';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleType } from '@/types/organization';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';

interface UserTableRowProps {
  user: OrganizationUser;
  isCurrentUserOwner: boolean;
  isActionInProgress: boolean;
  currentUserId: string;
  userRole: string | null;
  onRemoveUser: (userId: string) => void;
  onUpdateRole?: (userId: string, newRole: string) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  isCurrentUserOwner,
  isActionInProgress,
  currentUserId,
  userRole,
  onRemoveUser,
  onUpdateRole
}) => {
  const [roleChangeSuccess, setRoleChangeSuccess] = useState<boolean | null>(null);
  const displayName = user.full_name || user.username || user.email || 'Unknown User';
  
  // Check if this is the current user's row
  const isCurrentUser = user.user_id === currentUserId;
  
  // Determine if the current user can manage this user's role
  const canManageRole = hasPermission(userRole, PERMISSIONS.MANAGE_TEAM) && 
                       (!isCurrentUser) && // Users can't change their own role
                       (user.role !== 'owner' || isCurrentUserOwner); // Only owners can manage other owners
                       
  const handleRoleChange = async (newRole: string) => {
    if (onUpdateRole) {
      setRoleChangeSuccess(null);
      
      try {
        await onUpdateRole(user.user_id, newRole);
        setRoleChangeSuccess(true);
        
        // Reset the success indicator after 3 seconds
        setTimeout(() => {
          setRoleChangeSuccess(null);
        }, 3000);
      } catch (error) {
        setRoleChangeSuccess(false);
        
        // Reset the error indicator after 3 seconds
        setTimeout(() => {
          setRoleChangeSuccess(null);
        }, 3000);
      }
    }
  };
  
  return (
    <TableRow className={isCurrentUser ? "bg-muted/40" : ""}>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="flex items-center gap-1">
            {displayName}
            {isCurrentUser && (
              <span className="text-xs text-muted-foreground ml-1">(you)</span>
            )}
          </span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {user.email}
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          {canManageRole && onUpdateRole ? (
            <div className="flex items-center gap-2">
              <Select 
                disabled={isActionInProgress}
                defaultValue={user.role} 
                onValueChange={handleRoleChange}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {isCurrentUserOwner && <SelectItem value="owner">Owner</SelectItem>}
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              
              {roleChangeSuccess === true && (
                <CheckCircle className="h-4 w-4 text-green-500 animate-pulse" />
              )}
              
              {roleChangeSuccess === false && (
                <AlertCircle className="h-4 w-4 text-red-500 animate-pulse" />
              )}
            </div>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge 
                    variant="outline" 
                    className={`${roleColors[user.role as keyof typeof roleColors] || ''} text-white`}
                  >
                    {user.role}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {user.role === 'owner' && "Full administrative access"}
                  {user.role === 'admin' && "Can manage most resources and team members"}
                  {user.role === 'member' && "Can create and use resources"}
                  {user.role === 'viewer' && "Read-only access"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex space-x-2">
          {hasPermission(userRole, PERMISSIONS.MANAGE_TEAM) && 
           !isCurrentUser && // Can't remove yourself
           user.role !== 'owner' && // Non-owners can't remove owners
           (isCurrentUserOwner || user.role !== 'admin') && // Only owners can remove admins
           (
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
