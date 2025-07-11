
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowUp, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import DeviceCard from '@/components/DeviceCard';
import { useDevices } from '@/hooks/useDevices';
import { useOrganization } from '@/contexts/organization';
import { useAuth } from '@/contexts/auth';
import { LoadingProgress } from '@/components/LoadingProgress';
import { useContextFactory } from '@/contexts/factory/ContextFactoryProvider';

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const { organization, isLoading: orgLoading } = useOrganization();
  const { initializationProgress = 0 } = useContextFactory();

  // Use the real devices hook instead of mock data
  const { devices, isLoading: devicesLoading, error } = useDevices(organization?.id);

  console.log('=== DASHBOARD COMPONENT DEBUG (REAL DATA) ===');
  console.log('Auth state:', { isAuthenticated });
  console.log('Organization:', organization);
  console.log('Devices:', devices);
  console.log('Devices count:', devices?.length);
  console.log('Initialization progress:', initializationProgress);

  // Show enhanced loading with progress
  if (orgLoading || initializationProgress < 100) {
    return (
      <LoadingProgress
        progress={initializationProgress}
        title="Loading Dashboard"
        description="Optimizing your IoT control center..."
      />
    );
  }

  // Show no organization state
  if (!organization?.id) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your IoT control center.</p>
        </div>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Organization Selected</h3>
              <p className="text-yellow-600 mb-4">Please select an organization to view devices and manage your IoT infrastructure.</p>
              <div className="text-sm text-yellow-500">
                You may need to create an organization or be invited to one to continue.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state if there's an error loading devices
  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to your IoT control center.</p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Devices</h3>
              <p className="text-red-600 mb-2">{error}</p>
              <p className="text-sm text-red-500">
                Organization: {organization.name} (ID: {organization.id})
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get only the first 4 devices for the dashboard preview
  const recentDevices = devices.slice(0, 4);

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to your IoT control center.</p>
        {/* Performance indicator - remove this later */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-400 mt-2">
            Org: {organization.name} | ID: {organization.id} | Devices: {devices.length} | Real API Data
          </div>
        )}
      </div>

      {/* Stats Cards - now with real data and better desktop layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                Live Data
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

      {/* Recent Devices - now with better desktop layout */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Recent Devices</h2>
          <Link to="/devices" className="text-sm text-primary flex items-center hover:underline">
            View all devices
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        {devicesLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div className="col-span-full">
                <Card className="border-dashed border-2 border-gray-300">
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground mb-2">
                      No devices found. Add your first device to get started.
                    </p>
                    <Link 
                      to="/devices" 
                      className="text-primary hover:underline"
                    >
                      Go to Devices page to add a device
                    </Link>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
