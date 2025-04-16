import React from "react";
import { NavLink } from "react-router-dom";
import { Home, BarChart, Settings, ListChecks, Box as BoxIcon } from "lucide-react";
import { SidebarNav } from "@/components/ui/sidebar";

export function DashboardMenuItems() {
  return (
    <SidebarNav>
      <NavLink 
        to="/dashboard" 
        icon={<Home className="h-4 w-4" />}
        exact // Match only the exact path
      >
        Home
      </NavLink>
      <NavLink 
        to="/dashboard/devices" 
        icon={<BarChart className="h-4 w-4" />}
      >
        Devices
      </NavLink>
      <NavLink 
        to="/dashboard/data-buckets" 
        icon={<ListChecks className="h-4 w-4" />}
      >
        Data Buckets
      </NavLink>
      <NavLink 
        to="/dashboard/endpoints" 
        icon={<Settings className="h-4 w-4" />}
      >
        Endpoints
      </NavLink>
      <NavLink 
        to="/dashboard/alarms" 
        icon={<Settings className="h-4 w-4" />}
      >
        Alarms
      </NavLink>
      <NavLink 
        to="/dashboard/storage" 
        icon={<Settings className="h-4 w-4" />}
      >
        File Storage
      </NavLink>
      <NavLink 
        to="/dashboard/products" 
        icon={<BoxIcon className="h-4 w-4" />}
      >
        Products
      </NavLink>
    </SidebarNav>
  );
}
