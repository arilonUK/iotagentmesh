
import React from "react";
import { useAuth } from "@/contexts/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import DashboardMenuItems from "@/components/navigation/DashboardMenuItems";
import SettingsMenuItems from "@/components/navigation/SettingsMenuItems";
import { OrganizationFooter } from "@/components/navigation/OrganizationFooter";

export function DashboardNav() {
  const { userRole } = useAuth();
  
  return (
    <Sidebar>
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <DashboardMenuItems />
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SettingsMenuItems userRole={userRole} />
        </SidebarGroup>

        <OrganizationFooter />
      </SidebarContent>
    </Sidebar>
  );
}
