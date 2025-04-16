
import React from "react";
import { NavLink } from "react-router-dom";
import { Home, BarChart, Settings, ListChecks, Box as BoxIcon } from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

export function DashboardMenuItems() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => isActive ? "text-primary" : ""}
            end
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NavLink 
            to="/dashboard/devices" 
            className={({ isActive }) => isActive ? "text-primary" : ""}
          >
            <BarChart className="h-4 w-4 mr-2" />
            Devices
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NavLink 
            to="/dashboard/data-buckets" 
            className={({ isActive }) => isActive ? "text-primary" : ""}
          >
            <ListChecks className="h-4 w-4 mr-2" />
            Data Buckets
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NavLink 
            to="/dashboard/products" 
            className={({ isActive }) => isActive ? "text-primary" : ""}
          >
            <BoxIcon className="h-4 w-4 mr-2" />
            Products
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
