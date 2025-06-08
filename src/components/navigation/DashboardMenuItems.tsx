
import { Home, Settings, Laptop, AlertTriangle, Package, LifeBuoy, Upload, Bell, Layers, Link } from 'lucide-react';
import { NavMenuItem } from '@/components/navigation/NavMenuItem';
import { SidebarMenu } from '@/components/ui/sidebar';

export default function DashboardMenuItems() {
  return (
    <SidebarMenu className="list-none p-0 m-0">
      <NavMenuItem to="/" icon={Home} end>
        Dashboard
      </NavMenuItem>
      
      <NavMenuItem 
        to="/devices" 
        icon={Laptop}
      >
        Devices
      </NavMenuItem>
      
      <NavMenuItem 
        to="/products" 
        icon={Package}
      >
        Products
      </NavMenuItem>
      
      <NavMenuItem 
        to="/alarms" 
        icon={AlertTriangle}
      >
        Alarms
      </NavMenuItem>

      <NavMenuItem 
        to="/data-buckets" 
        icon={Layers}
      >
        Data Management
      </NavMenuItem>
      
      <NavMenuItem 
        to="/integrations" 
        icon={Link}
      >
        Integrations
      </NavMenuItem>
      
      <NavMenuItem 
        to="/endpoints" 
        icon={Link}
      >
        Endpoints
      </NavMenuItem>
      
      <NavMenuItem 
        to="/file-storage" 
        icon={Upload}
      >
        File Storage
      </NavMenuItem>
      
      <NavMenuItem 
        to="/notifications/settings" 
        icon={Bell}
      >
        Notifications
      </NavMenuItem>
      
      <NavMenuItem 
        to="/settings" 
        icon={Settings}
      >
        Settings
      </NavMenuItem>
      
      <NavMenuItem 
        to="/documentation" 
        icon={LifeBuoy}
      >
        Documentation
      </NavMenuItem>
    </SidebarMenu>
  );
}
