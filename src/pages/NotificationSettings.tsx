
import React from 'react';
import { NotificationSettings as NotificationSettingsComponent } from '@/components/notifications/NotificationSettings';
import DashboardLayout from '@/layouts/DashboardLayout';

const NotificationSettingsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <NotificationSettingsComponent />
    </DashboardLayout>
  );
};

export default NotificationSettingsPage;
