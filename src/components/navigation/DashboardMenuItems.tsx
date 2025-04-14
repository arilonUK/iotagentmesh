
import React from "react";
import { 
  SidebarMenu, SidebarMenuItem, SidebarMenuButton 
} from "@/components/ui/sidebar";
import { useLocation } from "react-router-dom";
import { 
  LayoutDashboard, LineChart, Clock, Bell, Hammer, Database, Radio, 
  Settings, HardDrive 
} from "lucide-react";

function isActive(href: string) {
  const { pathname } = useLocation();
  return pathname === href;
}

export function DashboardMenuItems() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton isActive={isActive("/dashboard")} asChild>
          <a href="/dashboard">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton isActive={isActive("/dashboard/devices")} asChild>
          <a href="/dashboard/devices">
            <Radio className="w-4 h-4" />
            Devices
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton isActive={isActive("/dashboard/alarms")} asChild>
          <a href="/dashboard/alarms">
            <Bell className="w-4 h-4" />
            Alarms
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton isActive={isActive("/dashboard/endpoints")} asChild>
          <a href="/dashboard/endpoints">
            <Hammer className="w-4 h-4" />
            Endpoints
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton isActive={isActive("/dashboard/data-buckets")} asChild>
          <a href="/dashboard/data-buckets">
            <Database className="w-4 h-4" />
            Data Buckets
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton isActive={isActive("/dashboard/storage")} asChild>
          <a href="/dashboard/storage">
            <HardDrive className="w-4 h-4" />
            Storage
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton>
          <Clock className="w-4 h-4" />
          History
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton>
          <LineChart className="w-4 h-4" />
          Analysis
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton>
          <Settings className="w-4 h-4" />
          Config
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
