
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SettingsMenuItemsProps {
  userRole: string | null;
}

export function SettingsMenuItems({ userRole }: SettingsMenuItemsProps) {
  const { pathname } = useLocation();
  
  // Check permissions
  const canManageTeam = hasPermission(userRole, PERMISSIONS.MANAGE_TEAM);
  const canManageOrganization = hasPermission(userRole, PERMISSIONS.MANAGE_ORGANIZATION);
  
  return (
    <SidebarMenu className="list-none p-0 m-0">
      <SidebarMenuItem className="list-none">
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
      
      <SidebarMenuItem className="list-none">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === "/dashboard/team"} 
                  tooltip="Team"
                  disabled={!canManageTeam && userRole !== null}
                >
                  <Link to="/dashboard/team" className={cn(
                    "flex items-center gap-3 w-full",
                    pathname === "/dashboard/team" && "font-medium",
                    (!canManageTeam && userRole !== null) && "opacity-50 cursor-not-allowed pointer-events-none"
                  )}>
                    <Icons.users className="h-4 w-4" />
                    <span>Team Management</span>
                  </Link>
                </SidebarMenuButton>
              </div>
            </TooltipTrigger>
            {!canManageTeam && userRole !== null && (
              <TooltipContent>
                <p>You need admin or owner permissions to manage team</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </SidebarMenuItem>

      <SidebarMenuItem className="list-none">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === "/dashboard/organization"} 
                  tooltip="Organization"
                  disabled={!canManageOrganization && userRole !== null}
                >
                  <Link to="/dashboard/organization" className={cn(
                    "flex items-center gap-3 w-full",
                    pathname === "/dashboard/organization" && "font-medium",
                    (!canManageOrganization && userRole !== null) && "opacity-50 cursor-not-allowed pointer-events-none"
                  )}>
                    <Icons.building className="h-4 w-4" />
                    <span>Organization Settings</span>
                  </Link>
                </SidebarMenuButton>
              </div>
            </TooltipTrigger>
            {!canManageOrganization && userRole !== null && (
              <TooltipContent>
                <p>Only organization owners can access organization settings</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
