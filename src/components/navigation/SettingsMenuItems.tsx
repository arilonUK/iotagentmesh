
import React from 'react';
import { Users, Settings, User } from 'lucide-react';
import { NavMenuItem } from '@/components/navigation/NavMenuItem';
import { SidebarMenu } from '@/components/ui/sidebar';

interface SettingsMenuItemsProps {
  userRole?: string;
}

const SettingsMenuItems: React.FC<SettingsMenuItemsProps> = ({ userRole }) => {
  return (
    <SidebarMenu className="list-none p-0 m-0">
      <NavMenuItem to="/dashboard/profile" icon={User}>
        Profile
      </NavMenuItem>
      
      <NavMenuItem to="/dashboard/team" icon={Users}>
        Team
      </NavMenuItem>
      
      <NavMenuItem to="/dashboard/settings" icon={Settings}>
        Organization
      </NavMenuItem>
    </SidebarMenu>
  );
};

export default SettingsMenuItems;
