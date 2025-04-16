
import React from "react";
import { NavLink } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

interface NavMenuItemProps {
  to: string;
  icon: LucideIcon;
  children: React.ReactNode;
  end?: boolean;
}

export function NavMenuItem({ to, icon: Icon, children, end }: NavMenuItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink 
          to={to} 
          className={({ isActive }) => isActive ? "text-primary" : ""}
          end={end}
        >
          <Icon className="h-4 w-4 mr-2" />
          {children}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
