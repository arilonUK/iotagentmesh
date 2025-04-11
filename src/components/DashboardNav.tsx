
import { useLocation } from "react-router-dom";
import {
  Database,
  Home,
  LayoutDashboard,
  Settings,
  SmartphoneNfc,
  Users,
  DatabaseZap
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function DashboardNav() {
  const location = useLocation();
  const pathname = location.pathname;

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
      title: "Settings",
      href: "/dashboard/settings/profile",
      icon: Settings,
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

  // Render the navigation
  return (
    <nav className="grid gap-1 px-2">
      {navItems.map((item) => {
        const active = isActive(item.href, item.exact);
        const subItemsActive = item.subItems ? isSubItemActive(item.subItems) : false;

        return (
          <div key={item.href} className="mb-2">
            <Button
              asChild
              variant={active || subItemsActive ? "secondary" : "ghost"}
              className={cn("w-full justify-start", 
                active || subItemsActive ? "bg-muted font-medium" : ""
              )}
            >
              <Link to={item.href} className="flex items-center">
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            </Button>

            {/* Render sub-items if they exist */}
            {item.subItems && (
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
          </div>
        );
      })}
    </nav>
  );
}
