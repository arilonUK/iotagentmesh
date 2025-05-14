
import React, { useState } from 'react';
import DeviceCard from '@/components/DeviceCard';
import { Device } from '@/types/device';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { useDeviceGroups } from '@/hooks/useDeviceGroups';
import { useOrganization } from '@/contexts/organization';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ListFilter, Grid, RefreshCw } from 'lucide-react';

interface DeviceGridProps {
  devices: Device[];
  filteredDevices: Device[];
  onRetry: () => void;
  enableSelection?: boolean;
  selectedDevices?: string[];
  onSelectDevice?: (deviceId: string, isSelected: boolean) => void;
  onSelectAll?: (devices: Device[], isSelected: boolean) => void;
  filterGroup?: string;
}

const DeviceGrid: React.FC<DeviceGridProps> = ({ 
  devices,
  filteredDevices,
  onRetry,
  enableSelection = false,
  selectedDevices = [],
  onSelectDevice,
  onSelectAll,
  filterGroup = 'all'
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const { organization } = useOrganization();
  const { deviceGroups } = useDeviceGroups(organization?.id);
  const [isLoading, setIsLoading] = useState(false);
  
  // Further filter devices by group if needed
  const displayDevices = React.useMemo(() => {
    if (filterGroup === 'all') return filteredDevices;
    
    // Here we would ideally filter by group membership
    // For now we'll assume all devices are in all groups for demo purposes
    return filteredDevices;
  }, [filteredDevices, filterGroup]);
  
  const isAllSelected = enableSelection && 
    selectedDevices.length > 0 && 
    displayDevices.every(device => selectedDevices.includes(device.id));

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectAll) {
      onSelectAll(displayDevices, event.target.checked);
    }
  };

  const handleSelectDevice = (deviceId: string, isSelected: boolean) => {
    if (onSelectDevice) {
      onSelectDevice(deviceId, isSelected);
    }
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'table' : 'grid');
  };

  if (displayDevices.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/10">
        <p className="text-muted-foreground mb-2">
          {devices.length > 0 
            ? "No devices match your filter criteria" 
            : "No devices found for this organization"}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          {devices.length > 0
            ? "Try adjusting your search or filters above"
            : "You can add devices using the 'Add Device' button above"}
        </p>
        <Button 
          className="mt-4" 
          variant="outline" 
          onClick={onRetry}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Devices
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {displayDevices.length} of {devices.length} devices
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleViewMode}
            className="flex items-center gap-1"
          >
            {viewMode === 'grid' ? (
              <>
                <ListFilter className="h-4 w-4" />
                <span>Table View</span>
              </>
            ) : (
              <>
                <Grid className="h-4 w-4" />
                <span>Grid View</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayDevices.map((device) => (
            <div key={device.id} className="relative">
              {enableSelection && (
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox 
                    checked={selectedDevices.includes(device.id)}
                    onCheckedChange={(checked) => 
                      handleSelectDevice(device.id, checked as boolean)
                    }
                  />
                </div>
              )}
              <DeviceCard 
                id={device.id}
                name={device.name}
                type={device.type}
                status={device.status}
                last_active_at={device.last_active_at}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                {enableSelection && (
                  <TableHead className="w-[50px]">
                    <Checkbox 
                      checked={isAllSelected}
                      onCheckedChange={(checked) => {
                        if (onSelectAll) {
                          onSelectAll(displayDevices, checked as boolean);
                        }
                      }}
                    />
                  </TableHead>
                )}
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayDevices.map((device) => (
                <TableRow key={device.id}>
                  {enableSelection && (
                    <TableCell>
                      <Checkbox 
                        checked={selectedDevices.includes(device.id)}
                        onCheckedChange={(checked) => 
                          handleSelectDevice(device.id, checked as boolean)
                        }
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">
                    <a 
                      href={`/dashboard/devices/${device.id}`}
                      className="text-primary hover:underline"
                    >
                      {device.name}
                    </a>
                  </TableCell>
                  <TableCell>{device.type}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        device.status === 'online' ? 'default' :
                        device.status === 'warning' ? 'warning' :
                        'outline'
                      }
                    >
                      {device.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(device.last_active_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default DeviceGrid;
