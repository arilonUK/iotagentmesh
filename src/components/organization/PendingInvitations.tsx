
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
import { Mail, RefreshCw, Trash } from 'lucide-react';
import { roleColors } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

const PendingInvitations = () => {
  const { organization } = useAuth();
  const [invitations, setInvitations] = useState<InvitationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchInvitations = async () => {
    if (!organization) return;
    
    try {
      setLoading(true);
      const data = await invitationServices.getOrganizationInvitations(organization.id);
      setInvitations(data);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [organization]);

  const handleResend = async (invitationId: string) => {
    setActionInProgress(invitationId);
    try {
      await invitationServices.resendInvitation(invitationId);
      fetchInvitations();
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (invitationId: string) => {
    setActionInProgress(invitationId);
    try {
      await invitationServices.deleteInvitation(invitationId);
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
    } finally {
      setActionInProgress(null);
    }
  };

  if (!organization) {
    return null;
  }

  if (loading) {
    return <div className="text-center py-6">Loading invitations...</div>;
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No pending invitations found.
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => {
            const isExpired = new Date(invitation.expires_at) < new Date();
            const isActionInProgress = actionInProgress === invitation.id;
            
            return (
              <TableRow key={invitation.id}>
                <TableCell className="font-medium">{invitation.email}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`${roleColors[invitation.role]} text-white`}
                  >
                    {invitation.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  {isExpired ? (
                    <span className="text-red-500">Expired</span>
                  ) : (
                    formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResend(invitation.id)}
                      disabled={isActionInProgress}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isActionInProgress}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Invitation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the invitation sent to {invitation.email}?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(invitation.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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

export default PendingInvitations;
