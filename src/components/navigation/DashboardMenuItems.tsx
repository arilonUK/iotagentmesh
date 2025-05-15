
import { Home, Settings, Devices, BarChart2, AlertTriangle, Package, LifeBuoy, Upload, Bell, Layers, Link, Calendar } from 'lucide-react';
import { NavMenuItem } from '@/components/navigation/NavMenuItem';

export default function DashboardMenuItems() {
  return (
    <>
      <NavMenuItem href="/dashboard" icon={<Home className="h-5 w-5" />} title="Dashboard" />
      
      <NavMenuItem 
        href="/dashboard/devices" 
        icon={<Devices className="h-5 w-5" />} 
        title="Devices"
      />
      
      <NavMenuItem 
        href="/dashboard/products" 
        icon={<Package className="h-5 w-5" />} 
        title="Products"
      />
      
      <NavMenuItem 
        href="/dashboard/alarms" 
        icon={<AlertTriangle className="h-5 w-5" />} 
        title="Alarms"
      />

      <NavMenuItem 
        href="/dashboard/data-buckets" 
        icon={<Layers className="h-5 w-5" />} 
        title="Data Management"
      />
      
      <NavMenuItem 
        href="/dashboard/integrations" 
        icon={<Link className="h-5 w-5" />} 
        title="Integrations"
      />
      
      <NavMenuItem 
        href="/dashboard/endpoints" 
        icon={<Link className="h-5 w-5" />} 
        title="Endpoints"
      />
      
      <NavMenuItem 
        href="/dashboard/file-storage" 
        icon={<Upload className="h-5 w-5" />} 
        title="File Storage"
      />
      
      <NavMenuItem 
        href="/dashboard/notifications/settings" 
        icon={<Bell className="h-5 w-5" />} 
        title="Notifications"
      />
      
      <NavMenuItem 
        href="/dashboard/settings" 
        icon={<Settings className="h-5 w-5" />} 
        title="Settings"
      />
      
      <NavMenuItem 
        href="https://docs.example.com" 
        icon={<LifeBuoy className="h-5 w-5" />} 
        title="Documentation"
        external
      />
    </>
  );
}
