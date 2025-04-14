import React from "react";
import { SidebarItem } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, LineChart, Clock, Bell, Hammer, Database, Radio, 
  Settings, HardDrive 
} from "lucide-react";

function isActive(href: string) {
  const pathname = usePathname();
  return pathname === href;
}

export function DashboardMenuItems() {
  return (
    <>
      <SidebarItem active={isActive("/dashboard")} href="/dashboard">
        <LayoutDashboard className="w-4 h-4" />
        Dashboard
      </SidebarItem>
      
      <SidebarItem active={isActive("/dashboard/devices")} href="/dashboard/devices">
        <Radio className="w-4 h-4" />
        Devices
      </SidebarItem>
      
      <SidebarItem active={isActive("/dashboard/alarms")} href="/dashboard/alarms">
        <Bell className="w-4 h-4" />
        Alarms
      </SidebarItem>
      
      <SidebarItem active={isActive("/dashboard/endpoints")} href="/dashboard/endpoints">
        <Hammer className="w-4 h-4" />
        Endpoints
      </SidebarItem>
      
      <SidebarItem active={isActive("/dashboard/data-buckets")} href="/dashboard/data-buckets">
        <Database className="w-4 h-4" />
        Data Buckets
      </SidebarItem>
      
      <SidebarItem active={isActive("/dashboard/storage")} href="/dashboard/storage">
        <HardDrive className="w-4 h-4" />
        Storage
      </SidebarItem>
      
      <SidebarItem>
        <Clock className="w-4 h-4" />
        History
      </SidebarItem>
      
      <SidebarItem>
        <LineChart className="w-4 h-4" />
        Analysis
      </SidebarItem>
      
      <SidebarItem>
        <Settings className="w-4 h-4" />
        Config
      </SidebarItem>
    </>
  );
}
