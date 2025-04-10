
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Gauge, HardDrive, BarChart3, Settings, Users, Bell, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const items = [
  {
    title: "Dashboard",
    icon: <Home size={18} />,
    href: "/dashboard",
  },
  {
    title: "Devices",
    icon: <HardDrive size={18} />,
    href: "/dashboard/devices",
  },
  {
    title: "Statistics",
    icon: <BarChart3 size={18} />,
    href: "/dashboard/statistics",
  },
  {
    title: "Projects",
    icon: <Gauge size={18} />,
    href: "/dashboard/projects",
  },
  {
    title: "Settings",
    icon: <Settings size={18} />,
    href: "/dashboard/settings",
  },
];

const DashboardNav = () => {
  const location = useLocation();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 border-r border-gray-100 bg-white hidden md:block">
      <div className="flex h-16 items-center border-b px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 rounded-lg iot-gradient-bg flex items-center justify-center">
            <span className="font-bold text-lg">N</span>
          </div>
          <span className="text-xl font-semibold">NextGenIOT</span>
        </Link>
      </div>
      <div className="flex flex-col gap-1 p-4">
        <p className="text-xs font-medium text-muted-foreground px-2 py-1.5">Menu</p>
        <nav className="grid gap-1 px-2">
          {items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent transition-colors",
                location.pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-2">
          <Button variant="outline" className="w-full justify-start gap-3 mt-10" asChild>
            <Link to="/logout">
              <LogOut size={18} />
              <span>Log out</span>
            </Link>
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default DashboardNav;
