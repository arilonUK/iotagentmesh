
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Circle, ArrowLeft, Power, RefreshCw, Settings, Trash2, Clock, Activity } from 'lucide-react';
import DeviceStats from '@/components/DeviceStats';

const mockDeviceData = {
  '1': {
    id: '1',
    name: 'Temperature Sensor',
    type: 'Sensor',
    status: 'online',
    lastActive: '2 minutes ago',
    location: 'Living Room',
    serialNumber: 'TS-2023-A42F',
    firmware: 'v2.1.5',
    batteryLevel: 92,
    ipAddress: '192.168.1.105',
    createdAt: '2023-05-15'
  },
  '2': {
    id: '2',
    name: 'Smart Light',
    type: 'Actuator',
    status: 'online',
    lastActive: '5 minutes ago',
    location: 'Bedroom',
    serialNumber: 'SL-2023-B78C',
    firmware: 'v1.9.2',
    batteryLevel: null, // Powered by mains
    ipAddress: '192.168.1.110',
    createdAt: '2023-06-20'
  }
};

const statusColors = {
  online: 'bg-iot-success',
  offline: 'bg-iot-gray',
  warning: 'bg-iot-warning',
};

const DeviceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const device = id ? mockDeviceData[id as keyof typeof mockDeviceData] : undefined;

  if (!device) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold mb-4">Device not found</h2>
        <Link to="/dashboard/devices">
          <Button>Back to devices</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div>
          <Link to="/dashboard/devices" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to devices
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{device.name}</h1>
            <Badge variant={device.status === 'online' ? 'default' : 'secondary'} className="ml-2">
              <Circle className={`h-2 w-2 mr-1 ${statusColors[device.status as keyof typeof statusColors]}`} />
              {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button size="sm" variant={device.status === 'online' ? 'destructive' : 'default'}>
            <Power className="mr-2 h-4 w-4" />
            {device.status === 'online' ? 'Turn Off' : 'Turn On'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-3 text-sm">
                  <div className="grid grid-cols-2 gap-1">
                    <dt className="text-muted-foreground">Type:</dt>
                    <dd>{device.type}</dd>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <dt className="text-muted-foreground">Location:</dt>
                    <dd>{device.location}</dd>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <dt className="text-muted-foreground">Serial Number:</dt>
                    <dd>{device.serialNumber}</dd>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <dt className="text-muted-foreground">Firmware Version:</dt>
                    <dd>{device.firmware}</dd>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <dt className="text-muted-foreground">IP Address:</dt>
                    <dd>{device.ipAddress}</dd>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <dt className="text-muted-foreground">Created:</dt>
                    <dd>{device.createdAt}</dd>
                  </div>
                  {device.batteryLevel !== null && (
                    <div className="grid grid-cols-2 gap-1">
                      <dt className="text-muted-foreground">Battery Level:</dt>
                      <dd>{device.batteryLevel}%</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Activity className="h-4 w-4 text-iot-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Device came online</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {device.lastActive}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <RefreshCw className="h-4 w-4 text-iot-info" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Firmware updated to {device.firmware}</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        1 day ago
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Settings className="h-4 w-4 text-iot-gray" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Configuration updated</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        3 days ago
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="statistics">
          <DeviceStats deviceId={device.id} />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Device Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">
                  Actions here can't be undone. Please be careful.
                </p>
                <div className="flex gap-4">
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Device
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeviceDetail;
