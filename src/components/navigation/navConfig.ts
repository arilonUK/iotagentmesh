
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
    href: '/dashboard/devices',
    icon: 'IoT',
  },
  {
    title: 'Alarms',
    href: '/dashboard/alarms',
    icon: 'Alert',
  },
  {
    title: 'Data Buckets',
    href: '/dashboard/data-buckets',
    icon: 'Archive',
  },
  {
    title: 'Endpoints',
    href: '/dashboard/endpoints',
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
    to: '/dashboard/devices',
    icon: CircuitBoard,
    end: false
  },
  {
    label: 'Alarms',
    to: '/dashboard/alarms',
    icon: AlertTriangle,
    end: false
  },
  {
    label: 'Data Buckets',
    to: '/dashboard/data-buckets',
    icon: Archive,
    end: false
  },
  {
    label: 'Endpoints',
    to: '/dashboard/endpoints',
    icon: Mail,
    end: false
  }
];

export const settingsMenuConfig = [
  {
    title: 'Organization',
    href: '/dashboard/organization',
    icon: Building2,
  },
  {
    title: 'Users',
    href: '/dashboard/team',
    icon: Users,
  },
  {
    title: 'Settings',
    href: '/dashboard/profile',
    icon: Settings,
  },
  {
    title: 'Notifications',
    href: '/dashboard/notification-settings',
    icon: Bell,
  },
];
