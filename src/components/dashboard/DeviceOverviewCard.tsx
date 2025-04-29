
import React from 'react';
import { Device } from '@/types/device';
import { DashboardCard } from './DashboardCard';
import { Badge } from '@/components/ui/badge';
import { Calendar, Info, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DeviceOverviewCardProps {
  device: Device;
  loading?: boolean;
  error?: string | null;
}

export const DeviceOverviewCard = ({ device, loading, error }: DeviceOverviewCardProps) => {
  if (!device && !loading && !error) {
    return null;
  }
  
  return (
    <DashboardCard
      title="Device Overview"
      loading={loading}
      error={error}
      headerAction={
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <Info className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Overview of device information and status</p>
          </TooltipContent>
        </Tooltip>
      }
    >
      {device && (
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge className={`${
                device.status === 'online' ? 'bg-green-500' : 
                device.status === 'offline' ? 'bg-gray-500' : 
                'bg-yellow-500'
              }`}>
                {device.status}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Type</span>
              <span className="text-sm">{device.type}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last Active</span>
              <div className="flex items-center text-sm">
                <Calendar className="mr-1 h-3 w-3" />
                {device.last_active_at ? new Date(device.last_active_at).toLocaleString() : 'Never'}
              </div>
            </div>
          </div>
          
          {device.description && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">{device.description}</p>
            </div>
          )}
        </div>
      )}
    </DashboardCard>
  );
};
