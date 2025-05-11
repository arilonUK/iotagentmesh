
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InviteMemberForm from '@/components/organization/InviteMemberForm';
import PendingInvitations from '@/components/organization/PendingInvitations';
import UserManagement from '@/components/organization/UserManagement';
import { Mail, Users, UserPlus, Building, Shield } from 'lucide-react';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';

const TeamSettings = () => {
  const { organization, userRole } = useAuth();
  
  // Check if user has permission to view team settings
  const canViewTeam = hasPermission(userRole, PERMISSIONS.VIEW_DEVICES); // Lowest permission level
  
  if (!organization || !canViewTeam) {
    return (
      <div className="container max-w-3xl py-8">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Shield className="h-5 w-5 text-amber-500" />
            <div>
              <CardTitle>Team Settings</CardTitle>
              <CardDescription>
                You don't have permission to access team settings.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="invite" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span>Invite Members</span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>Pending Invites</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Organization Members</CardTitle>
              <CardDescription>
                Manage users in your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invite">
          <Card>
            <CardHeader>
              <CardTitle>Invite Team Members</CardTitle>
              <CardDescription>
                Invite colleagues to join your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InviteMemberForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>
                Manage outstanding invitations to your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PendingInvitations />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamSettings;
