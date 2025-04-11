
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { invitationServices, InvitationType } from '@/contexts/auth/invitationServices';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { roleColors } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { User, UserX } from 'lucide-react';

type OrganizationUser = {
  id: string;
  user_id: string;
  role: string;
  email?: string;
  full_name?: string;
  username?: string;
};

const UserManagement = () => {
  const { organization, userRole } = useAuth();
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchOrganizationUsers = async () => {
    if (!organization) return;
    
    setLoading(true);
    try {
      const { data: orgMembers, error: membersError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', organization.id);
      
      if (membersError) {
        toast('Error fetching members', { 
          style: { backgroundColor: 'red', color: 'white' } 
        });
        return;
      }

      // For each member, fetch profile info
      const usersWithProfiles = await Promise.all(
        orgMembers.map(async (member) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', member.user_id)
            .single();

          return {
            ...member,
            email: profile?.username, // Username might be email
            full_name: profile?.full_name,
            username: profile?.username
          };
        })
      );
      
      setUsers(usersWithProfiles);
    } catch (error) {
      console.error('Error fetching organization users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizationUsers();
  }, [organization]);

  const handleRemoveUser = async (userId: string) => {
    if (!organization) return;
    
    setActionInProgress(userId);
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('organization_id', organization.id)
        .eq('user_id', userId);

      if (error) {
        toast('Error removing user', { 
          style: { backgroundColor: 'red', color: 'white' } 
        });
        return;
      }

      toast('User removed successfully', {
        style: { backgroundColor: 'green', color: 'white' }
      });
      
      // Update the user list
      setUsers(users.filter(user => user.user_id !== userId));
    } catch (error) {
      console.error('Error removing user:', error);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'owner' | 'admin' | 'member' | 'viewer') => {
    if (!organization) return;
    
    setActionInProgress(userId);
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role: newRole })
        .eq('organization_id', organization.id)
        .eq('user_id', userId);

      if (error) {
        toast('Error updating role', { 
          style: { backgroundColor: 'red', color: 'white' } 
        });
        return;
      }

      toast('Role updated successfully', {
        style: { backgroundColor: 'green', color: 'white' }
      });
      
      // Update the user list
      setUsers(users.map(user => 
        user.user_id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setActionInProgress(null);
    }
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isCurrentUserOwner = userRole === 'owner';
            const isActionInProgress = actionInProgress === user.user_id;
            const displayName = user.full_name || user.username || user.email || 'Unknown User';
            
            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{displayName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`${roleColors[user.role as keyof typeof roleColors]} text-white`}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {isCurrentUserOwner && user.role !== 'owner' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isActionInProgress}
                          >
                            <UserX className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {displayName} from this organization?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleRemoveUser(user.user_id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserManagement;
