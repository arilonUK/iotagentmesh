
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { useOrganization } from "@/contexts/organization";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

export function DashboardNav() {
  const { pathname } = useLocation();
  const { organization } = useOrganization();
  const { signOut, profile, userRole } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  // Check if user has admin or owner permissions for team settings
  const canAccessTeamSettings = userRole === 'admin' || userRole === 'owner';
  
  return (
    <Sidebar>
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={pathname === "/dashboard"}
                tooltip="Home"
              >
                <Link to="/dashboard" className={cn(
                  "flex items-center gap-3 w-full",
                  pathname === "/dashboard" && "font-medium"
                )}>
                  <Icons.home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={pathname.startsWith("/dashboard/devices")}
                tooltip="Devices"
              >
                <Link to="/dashboard/devices" className={cn(
                  "flex items-center gap-3 w-full",
                  pathname.startsWith("/dashboard/devices") && "font-medium"
                )}>
                  <Icons.devices className="h-4 w-4" />
                  <span>Devices</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={pathname.startsWith("/dashboard/endpoints")}
                tooltip="Endpoints"
              >
                <Link to="/dashboard/endpoints" className={cn(
                  "flex items-center gap-3 w-full",
                  pathname.startsWith("/dashboard/endpoints") && "font-medium"
                )}>
                  <Icons.activity className="h-4 w-4" />
                  <span>Endpoints</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={pathname === "/dashboard/alarms"} 
                tooltip="Alarms"
              >
                <Link to="/dashboard/alarms" className={cn(
                  "flex items-center gap-3 w-full",
                  pathname === "/dashboard/alarms" && "font-medium"
                )}>
                  <Icons.bell className="h-4 w-4" />
                  <span>Alarms</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={pathname.startsWith("/dashboard/data-buckets")} 
                tooltip="Data Buckets"
              >
                <Link to="/dashboard/data-buckets" className={cn(
                  "flex items-center gap-3 w-full",
                  pathname.startsWith("/dashboard/data-buckets") && "font-medium"
                )}>
                  <Icons.database className="h-4 w-4" />
                  <span>Data Buckets</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
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
        </SidebarGroup>

        {organization && (
          <div className="mt-auto pt-4 px-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="justify-start w-full text-left">
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={organization.logo} alt={organization.name} />
                        <AvatarFallback>{organization.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{organization.name}</span>
                    </div>
                    <Icons.chevronDown className="h-4 w-4 opacity-50" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60" align="start">
                {userRole === 'owner' && (
                  <>
                    <DropdownMenuItem>
                      <Link to="/dashboard/organization" className="w-full">
                        Organization Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    setIsSigningOut(true);
                    signOut();
                  }}
                  disabled={isSigningOut}
                >
                  {isSigningOut ? (
                    <div className="flex items-center justify-center gap-2">
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      <span>Signing Out...</span>
                    </div>
                  ) : (
                    "Sign Out"
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
