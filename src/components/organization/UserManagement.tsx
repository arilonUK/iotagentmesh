
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
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
import { User, UserX } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

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
      // Create a custom RPC function to fetch members with their profiles
      // This avoids the RLS recursion issue
      const { data, error } = await supabase.rpc('get_organization_members', {
        p_org_id: organization.id
      });
      
      if (error) {
        console.error('Error fetching organization members:', error);
        
        // Try fallback method if RPC fails
        await fetchOrganizationUsersFallback();
        return;
      }
      
      if (data && Array.isArray(data)) {
        console.log('Fetched organization members:', data);
        setUsers(data as OrganizationUser[]);
      } else {
        console.log('No members found or invalid data format');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error in fetchOrganizationUsers:', error);
      
      // Try fallback method
      await fetchOrganizationUsersFallback();
    } finally {
      setLoading(false);
    }
  };
  
  // Fallback method using separate queries to avoid RLS recursion
  const fetchOrganizationUsersFallback = async () => {
    if (!organization) return;
    
    try {
      console.log('Using fallback method to fetch organization members');
      
      // First get user IDs with roles from a direct query or custom function
      const { data: rawMembers, error: membersError } = await supabase
        .from('organization_members')
        .select('id, user_id, role')
        .eq('organization_id', organization.id);
      
      if (membersError) {
        console.error('Fallback error fetching members:', membersError);
        toast('Error loading team members', { 
          style: { backgroundColor: 'red', color: 'white' } 
        });
        return;
      }
      
      if (!rawMembers || rawMembers.length === 0) {
        console.log('No members found');
        setUsers([]);
        return;
      }
      
      // For each member, fetch profile info
      const usersWithProfiles = await Promise.all(
        rawMembers.map(async (member) => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, username')
              .eq('id', member.user_id)
              .maybeSingle();
            
            return {
              ...member,
              email: profile?.username, // Username might be email
              full_name: profile?.full_name,
              username: profile?.username
            };
          } catch (profileError) {
            console.error('Error fetching profile:', profileError);
            return member;
          }
        })
      );
      
      setUsers(usersWithProfiles);
    } catch (error) {
      console.error('Error in fallback method:', error);
      toast('Error loading team members', {
        style: { backgroundColor: 'red', color: 'white' }
      });
      setUsers([]);
    }
  };

  useEffect(() => {
    if (organization?.id) {
      fetchOrganizationUsers();
    }
  }, [organization?.id]);

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

  const handleUpdateRole = async (userId: string, newRole: Database['public']['Enums']['role_type']) => {
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
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-4">
                No team members found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => {
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
                      className={`${roleColors[user.role as keyof typeof roleColors] || ''} text-white`}
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
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserManagement;
