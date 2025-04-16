
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
  
  console.log("Current user role:", userRole); // Debug log to see the actual role
  
  // Check if user has admin or owner permissions for team settings
  // Adjusted to show team settings menu even if userRole is null (for debugging)
  const canAccessTeamSettings = userRole === 'admin' || userRole === 'owner' || userRole === 'member' || userRole === null;
  
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton 
          asChild 
          isActive={pathname === "/dashboard/profile"} 
          tooltip="Profile"
        >
          <Link to="/dashboard/profile" className={cn(
            "flex items-center gap-3 w-full",
            pathname === "/dashboard/profile" && "font-medium"
          )}>
            <Icons.user className="h-4 w-4" />
            <span>Profile Settings</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      {/* Temporarily show team menu to all users for debugging */}
      <SidebarMenuItem>
        <SidebarMenuButton 
          asChild 
          isActive={pathname === "/dashboard/team"} 
          tooltip="Team"
        >
          <Link to="/dashboard/team" className={cn(
            "flex items-center gap-3 w-full",
            pathname === "/dashboard/team" && "font-medium"
          )}>
            <Icons.users className="h-4 w-4" />
            <span>Team Management</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {userRole === 'owner' && (
        <SidebarMenuItem>
          <SidebarMenuButton 
            asChild 
            isActive={pathname === "/dashboard/organization"} 
            tooltip="Organization"
          >
            <Link to="/dashboard/organization" className={cn(
              "flex items-center gap-3 w-full",
              pathname === "/dashboard/organization" && "font-medium"
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
