
import React from "react";
import { SidebarMenu } from "@/components/ui/sidebar";
import { NavMenuItem } from "./NavMenuItem";
import { dashboardMenuItems } from "./navConfig";

export function DashboardMenuItems() {
  return (
    <SidebarMenu>
      {dashboardMenuItems.map((item) => (
        <NavMenuItem
          key={item.to}
          to={item.to}
          icon={item.icon}
          end={item.end}
        >
          {item.label}
        </NavMenuItem>
      ))}
    </SidebarMenu>
  );
}
