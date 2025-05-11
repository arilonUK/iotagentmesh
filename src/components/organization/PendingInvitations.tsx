
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { InvitationType } from '@/contexts/auth/invitationServices';
import { invitationService } from '@/services/invitationService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  RefreshCw, 
  Trash2, 
  Clock, 
  Mail, 
  Shield,
  AlertCircle 
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const roleColors = {
  owner: 'bg-purple-500',
  admin: 'bg-blue-500',
  member: 'bg-green-500',
  viewer: 'bg-gray-500',
};

const PendingInvitations = () => {
  const { organization, userRole } = useAuth();
  const [invitations, setInvitations] = useState<InvitationType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Check if the user has permission to manage invitations
  const canManageInvitations = hasPermission(userRole, PERMISSIONS.INVITE_MEMBERS);

  useEffect(() => {
    if (organization?.id) {
      fetchInvitations();
    }
  }, [organization?.id]);

  const fetchInvitations = async () => {
    if (!organization?.id) return;
    
    setIsLoading(true);
    try {
      const data = await invitationService.getOrganizationInvitations(organization.id);
      setInvitations(data);
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    setIsProcessing(invitationId);
    try {
      await invitationService.resendInvitation(invitationId);
      // Refresh the list
      fetchInvitations();
    } catch (error) {
      console.error('Failed to resend invitation:', error);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDeleteInvitation = async (invitationId: string) => {
    setIsProcessing(invitationId);
    try {
      await invitationService.deleteInvitation(invitationId);
      // Update local state to remove the deleted invitation
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
    } catch (error) {
      console.error('Failed to delete invitation:', error);
    } finally {
      setIsProcessing(null);
    }
  };

  const isExpired = (expiresAt: string): boolean => {
    return new Date(expiresAt) < new Date();
  };

  if (!canManageInvitations) {
    return (
      <div className="flex justify-center py-6">
        <Card className="p-6 flex flex-col items-center gap-2 max-w-md text-center">
          <Shield className="h-10 w-10 text-amber-500" />
          <h3 className="text-lg font-medium">Permission Required</h3>
          <p className="text-sm text-muted-foreground">
            You need admin or owner privileges to view pending invitations.
          </p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading invitations...</p>
        </div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="flex justify-center py-6">
        <Card className="p-6 flex flex-col items-center gap-2 max-w-md text-center">
          <Mail className="h-10 w-10 text-gray-400" />
          <h3 className="text-lg font-medium">No Pending Invitations</h3>
          <p className="text-sm text-muted-foreground">
            There are no pending invitations for your organization.
          </p>
          <Button variant="outline" onClick={fetchInvitations} className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Button variant="outline" size="sm" className="mb-4" onClick={fetchInvitations}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => {
            const expired = isExpired(invitation.expires_at);
            
            return (
              <TableRow key={invitation.id}>
                <TableCell>{invitation.email}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`${roleColors[invitation.role as keyof typeof roleColors]} text-white`}
                  >
                    {invitation.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {format(new Date(invitation.created_at), 'PPpp')}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {expired ? (
                      <span className="flex items-center text-red-500 text-sm font-medium">
                        <AlertCircle className="h-3.5 w-3.5 mr-1" />
                        Expired
                      </span>
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {format(new Date(invitation.expires_at), 'PPpp')}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        disabled={isProcessing === invitation.id}
                      >
                        {isProcessing === invitation.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => handleResendInvitation(invitation.id)}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>Resend</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteInvitation(invitation.id)}
                        className="flex items-center gap-2 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
