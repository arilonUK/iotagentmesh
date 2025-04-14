
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

interface SettingsMenuItemsProps {
  userRole: string | null;
}

export function SettingsMenuItems({ userRole }: SettingsMenuItemsProps) {
  const { pathname } = useLocation();
  
  // Check if user has admin or owner permissions for team settings
  const canAccessTeamSettings = userRole === 'admin' || userRole === 'owner';
  
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton 
          asChild 
          isActive={pathname.startsWith("/dashboard/settings/profile")} 
          tooltip="Profile"
        >
          <Link to="/dashboard/settings/profile" className={cn(
            "flex items-center gap-3 w-full",
            pathname.startsWith("/dashboard/settings/profile") && "font-medium"
          )}>
            <Icons.user className="h-4 w-4" />
            <span>Profile Settings</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      {canAccessTeamSettings && (
        <SidebarMenuItem>
          <SidebarMenuButton 
            asChild 
            isActive={pathname.startsWith("/dashboard/settings/team")} 
            tooltip="Team"
          >
            <Link to="/dashboard/settings/team" className={cn(
              "flex items-center gap-3 w-full",
              pathname.startsWith("/dashboard/settings/team") && "font-medium"
            )}>
              <Icons.users className="h-4 w-4" />
              <span>Team Management</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}

      {userRole === 'owner' && (
        <SidebarMenuItem>
          <SidebarMenuButton 
            asChild 
            isActive={pathname.startsWith("/dashboard/organization")} 
            tooltip="Organization"
          >
            <Link to="/dashboard/organization" className={cn(
              "flex items-center gap-3 w-full",
              pathname.startsWith("/dashboard/organization") && "font-medium"
            )}>
              <Icons.building className="h-4 w-4" />
              <span>Organization Settings</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  );
}
