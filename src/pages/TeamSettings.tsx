
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InviteMemberForm from '@/components/organization/InviteMemberForm';
import PendingInvitations from '@/components/organization/PendingInvitations';
import { Mail, Users } from 'lucide-react';

const TeamSettings = () => {
  const { organization, userRole } = useAuth();
  
  // Only show this page for admins and owners
  if (!organization || (userRole !== 'admin' && userRole !== 'owner')) {
    return (
      <div className="container max-w-3xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Team Settings</CardTitle>
            <CardDescription>
              You don't have permission to access team settings.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8">
      <Tabs defaultValue="invite" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invite" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>Invite Members</span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Pending Invites</span>
          </TabsTrigger>
        </TabsList>

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
