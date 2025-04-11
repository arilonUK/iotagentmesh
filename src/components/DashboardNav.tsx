
import { useLocation } from "react-router-dom";
import {
  Database,
  Home,
  LayoutDashboard,
  Settings,
  SmartphoneNfc,
  DatabaseZap,
  ChevronDown,
  ChevronRight,
  Menu,
  Webhook
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

export function DashboardNav() {
  const location = useLocation();
  const pathname = location.pathname;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(["/dashboard/settings"]);

  // Navigation items with link configuration
  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: "Devices",
      href: "/dashboard/devices",
      icon: SmartphoneNfc,
    },
    {
      title: "Data Buckets",
      href: "/dashboard/data-buckets",
      icon: DatabaseZap,
    },
    {
      title: "Endpoints",
      href: "/dashboard/endpoints",
      icon: Webhook,
    },
    {
      title: "Settings",
      href: "/dashboard/settings/profile",
      icon: Settings,
      parentPath: "/dashboard/settings",
      subItems: [
        {
          title: "Profile",
          href: "/dashboard/settings/profile",
        },
        {
          title: "Team",
          href: "/dashboard/settings/team",
        },
      ],
    },
  ];

  // Helper function to determine if a link is active
  const isActive = (href: string, exact: boolean = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Helper function to determine if a subitem is active
  const isSubItemActive = (subItems: any[]) => {
    return subItems.some((item) => pathname === item.href);
  };

  // Handle parent item expansion
  const toggleExpand = (parentPath: string) => {
    setExpandedItems(prev => 
      prev.includes(parentPath)
        ? prev.filter(p => p !== parentPath)
        : [...prev, parentPath]
    );
  };

  // Check if a parent item is expanded
  const isExpanded = (parentPath?: string) => {
    return parentPath ? expandedItems.includes(parentPath) : false;
  };

  return (
    <div className={cn(
      "fixed left-0 top-0 bottom-0 z-30 flex flex-col bg-white border-r border-gray-100 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo/Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
        {!isCollapsed && (
          <div className="font-semibold text-lg text-iot-purple">IoT Platform</div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-auto"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Menu size={20} />
        </Button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4 px-2">
        <nav className="grid gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            const subItemsActive = item.subItems ? isSubItemActive(item.subItems) : false;
            const expanded = isExpanded(item.parentPath);

            return (
              <div key={item.href} className="mb-1">
                {item.subItems ? (
                  <>
                    <Button
                      variant={active || subItemsActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-between",
                        active || subItemsActive ? "bg-muted font-medium" : "",
                        isCollapsed ? "px-2" : "px-3"
                      )}
                      onClick={() => item.parentPath && toggleExpand(item.parentPath)}
                    >
                      <div className="flex items-center">
                        <item.icon className={cn("h-4 w-4", isCollapsed ? "mr-0" : "mr-2")} />
                        {!isCollapsed && <span>{item.title}</span>}
                      </div>
                      {!isCollapsed && item.subItems && (
                        expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                      )}
                    </Button>

                    {/* Render sub-items if they exist and section is expanded */}
                    {!isCollapsed && expanded && item.subItems && (
                      <div className="ml-6 mt-1 grid gap-1">
                        {item.subItems.map((subItem) => (
                          <Button
                            key={subItem.href}
                            asChild
                            variant={pathname === subItem.href ? "secondary" : "ghost"}
                            size="sm"
                            className={cn(
                              "justify-start",
                              pathname === subItem.href ? "bg-muted font-medium" : ""
                            )}
                          >
                            <Link to={subItem.href}>{subItem.title}</Link>
                          </Button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Button
                    asChild
                    variant={active ? "secondary" : "ghost"}
                    className={cn(
                      "w-full", 
                      active ? "bg-muted font-medium" : "",
                      isCollapsed ? "justify-center px-2" : "justify-start px-3"
                    )}
                  >
                    <Link to={item.href} className="flex items-center">
                      <item.icon className={cn("h-4 w-4", isCollapsed ? "mr-0" : "mr-2")} />
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  </Button>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4">
        <Separator className="mb-4" />
        <div className="flex items-center justify-center">
          {!isCollapsed && (
            <span className="text-xs text-muted-foreground">© 2025 IoT Platform</span>
          )}
        </div>
      </div>
    </div>
  );
}
