
import React from "react";
import { NavLink } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

interface NavMenuItemProps {
  to: string;
  icon: LucideIcon;
  children: React.ReactNode;
  end?: boolean;
  external?: boolean;
}

export function NavMenuItem({ to, icon: Icon, children, end, external }: NavMenuItemProps) {
  const linkContent = (
    <>
      <Icon className="h-4 w-4 mr-2" />
      {children}
    </>
  );

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        {external ? (
          <a href={to} target="_blank" rel="noopener noreferrer">
            {linkContent}
          </a>
        ) : (
          <NavLink 
            to={to} 
            className={({ isActive }) => isActive ? "text-primary" : ""}
            end={end}
          >
            {linkContent}
          </NavLink>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
