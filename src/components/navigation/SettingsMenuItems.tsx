
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, Settings, User, Shield } from 'lucide-react';

interface SettingsMenuItemsProps {
  userRole?: string;
}

const SettingsMenuItems: React.FC<SettingsMenuItemsProps> = ({ userRole }) => {
  return (
    <div className="space-y-1">
      <NavLink
        to="/dashboard/profile"
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
            isActive
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`
        }
      >
        <User className="mr-2 h-4 w-4" />
        <span>Profile</span>
      </NavLink>
      <NavLink
        to="/dashboard/team"
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
            isActive
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`
        }
      >
        <Users className="mr-2 h-4 w-4" />
        <span>Team</span>
      </NavLink>
      <NavLink
        to="/dashboard/settings"
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
            isActive
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`
        }
      >
        <Settings className="mr-2 h-4 w-4" />
        <span>Organization</span>
      </NavLink>
    </div>
  );
};

export default SettingsMenuItems;
