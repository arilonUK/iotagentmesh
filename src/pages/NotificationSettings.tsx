
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { NotificationSettings } from '@/components/notifications/NotificationSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotificationSettingsPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-3xl font-bold">Notification Settings</h1>
        
        <NotificationSettings />
        
        <Card>
          <CardHeader>
            <CardTitle>Notification History</CardTitle>
            <CardDescription>View and manage your notification history</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Coming soon: View and search your notification history</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
