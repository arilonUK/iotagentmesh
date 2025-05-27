
import React from 'react';
import { NotificationSettings as NotificationSettingsComponent } from '@/components/notifications/NotificationSettings';

const NotificationSettingsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <NotificationSettingsComponent />
    </div>
  );
};

export default NotificationSettingsPage;
