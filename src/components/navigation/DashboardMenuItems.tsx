
import { Home, Settings, Laptop, BarChart2, AlertTriangle, Package, LifeBuoy, Upload, Bell, Layers, Link, Calendar } from 'lucide-react';
import { NavMenuItem } from '@/components/navigation/NavMenuItem';

export default function DashboardMenuItems() {
  return (
    <>
      <NavMenuItem to="/dashboard" icon={Home} end>
        Dashboard
      </NavMenuItem>
      
      <NavMenuItem 
        to="/dashboard/devices" 
        icon={Laptop}
      >
        Devices
      </NavMenuItem>
      
      <NavMenuItem 
        to="/dashboard/products" 
        icon={Package}
      >
        Products
      </NavMenuItem>
      
      <NavMenuItem 
        to="/dashboard/alarms" 
        icon={AlertTriangle}
      >
        Alarms
      </NavMenuItem>

      <NavMenuItem 
        to="/dashboard/data-buckets" 
        icon={Layers}
      >
        Data Management
      </NavMenuItem>
      
      <NavMenuItem 
        to="/dashboard/integrations" 
        icon={Link}
      >
        Integrations
      </NavMenuItem>
      
      <NavMenuItem 
        to="/dashboard/endpoints" 
        icon={Link}
      >
        Endpoints
      </NavMenuItem>
      
      <NavMenuItem 
        to="/dashboard/file-storage" 
        icon={Upload}
      >
        File Storage
      </NavMenuItem>
      
      <NavMenuItem 
        to="/dashboard/notifications/settings" 
        icon={Bell}
      >
        Notifications
      </NavMenuItem>
      
      <NavMenuItem 
        to="/dashboard/settings" 
        icon={Settings}
      >
        Settings
      </NavMenuItem>
      
      <NavMenuItem 
        to="https://docs.example.com" 
        icon={LifeBuoy}
        external
      >
        Documentation
      </NavMenuItem>
    </>
  );
}
