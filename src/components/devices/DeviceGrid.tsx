
import React from 'react';
import DeviceCard from '@/components/DeviceCard';
import { Device } from '@/types/device';
import { Button } from '@/components/ui/button';

interface DeviceGridProps {
  devices: Device[];
  filteredDevices: Device[];
  onRetry: () => void;
}

const DeviceGrid: React.FC<DeviceGridProps> = ({ devices, filteredDevices, onRetry }) => {
  if (filteredDevices.length === 0) {
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
          Refresh Devices
        </Button>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredDevices.map((device) => (
        <DeviceCard 
          key={device.id}
          id={device.id}
          name={device.name}
          type={device.type}
          status={device.status}
          last_active_at={device.last_active_at}
        />
      ))}
    </div>
  );
};

export default DeviceGrid;
