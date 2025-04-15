
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowUp, ArrowDown, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import DeviceCard from '@/components/DeviceCard';
import { useDevices } from '@/hooks/useDevices';
import { useOrganization } from '@/contexts/organization';

const Dashboard = () => {
  const { organization } = useOrganization();
  const { devices, isLoading } = useDevices(organization?.id);

  // Get only the first 4 devices for the dashboard preview
  const recentDevices = devices.slice(0, 4);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to your IoT control center.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{devices.length}</div>
              <div className="text-xs font-medium flex items-center text-iot-success">
                <ArrowUp className="mr-1 h-4 w-4" />
                Recent
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {devices.filter(d => d.status === 'online').length}
              </div>
              <div className="text-xs font-medium flex items-center text-iot-success">
                <Activity className="mr-1 h-4 w-4" />
                Online
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">Healthy</div>
              <Activity className="h-5 w-5 text-iot-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {devices.filter(d => d.status === 'warning').length}
              </div>
              <div className="text-xs font-medium flex items-center text-yellow-500">
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Devices */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Devices</h2>
          <Link to="/dashboard/devices" className="text-sm text-primary flex items-center hover:underline">
            View all devices
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentDevices.map((device) => (
              <DeviceCard 
                key={device.id} 
                id={device.id}
                name={device.name}
                type={device.type}
                status={device.status}
                last_active_at={device.last_active_at}
              />
            ))}
            {recentDevices.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No devices found. Add your first device to get started.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
