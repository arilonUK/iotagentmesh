
import {
  LayoutDashboard,
  Settings,
  Users,
  Building2,
  Bell,
  Archive,
  Mail,
  AlertTriangle,
  CircuitBoard,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const mainNavConfig = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Devices',
    href: '/devices',
    icon: 'IoT',
  },
  {
    title: 'Alarms',
    href: '/alarms',
    icon: 'Alert',
  },
  {
    title: 'Data Buckets',
    href: '/data-buckets',
    icon: 'Archive',
  },
  {
    title: 'Endpoints',
    href: '/endpoints',
    icon: 'Mail',
  },
];

export const dashboardMenuItems = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: LayoutDashboard,
    end: true
  },
  {
    label: 'Devices',
    to: '/devices',
    icon: CircuitBoard,
    end: false
  },
  {
    label: 'Alarms',
    to: '/alarms',
    icon: AlertTriangle,
    end: false
  },
  {
    label: 'Data Buckets',
    to: '/data-buckets',
    icon: Archive,
    end: false
  },
  {
    label: 'Endpoints',
    to: '/endpoints',
    icon: Mail,
    end: false
  }
];

export const settingsMenuConfig = [
  {
    title: 'Organization',
    href: '/organization-settings',
    icon: Building2,
  },
  {
    title: 'Users',
    href: '/user-management',
    icon: Users,
  },
  {
    title: 'Settings',
    href: '/account-settings',
    icon: Settings,
  },
  {
    title: 'Notifications',
    href: '/notification-settings',
    icon: 'Bell', // Make sure this icon is imported in the icons.tsx file
  },
];
