
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

export function DashboardMenuItems() {
  const { pathname } = useLocation();
  
  return (
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
  );
}
