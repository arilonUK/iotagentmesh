
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowUp, ArrowDown, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import DeviceCard from '@/components/DeviceCard';

// Updated mock devices with real UUIDs that match those in the database
const mockDevices = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Temperature Sensor',
    type: 'Sensor',
    status: 'online' as const,
    lastActive: '2 minutes ago'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Smart Light',
    type: 'Actuator',
    status: 'online' as const,
    lastActive: '5 minutes ago'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Motion Detector',
    type: 'Sensor',
    status: 'offline' as const,
    lastActive: '3 hours ago'
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Air Quality Monitor',
    type: 'Sensor',
    status: 'warning' as const,
    lastActive: 'Just now'
  }
];

const Dashboard = () => {
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
              <div className="text-2xl font-bold">24</div>
              <div className="text-xs font-medium flex items-center text-iot-success">
                <ArrowUp className="mr-1 h-4 w-4" />
                12%
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
              <div className="text-2xl font-bold">18</div>
              <div className="text-xs font-medium flex items-center text-iot-success">
                <ArrowUp className="mr-1 h-4 w-4" />
                5%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Data Transfer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">2.4 GB</div>
              <div className="text-xs font-medium flex items-center text-iot-error">
                <ArrowDown className="mr-1 h-4 w-4" />
                3%
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockDevices.map((device) => (
            <DeviceCard key={device.id} {...device} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
