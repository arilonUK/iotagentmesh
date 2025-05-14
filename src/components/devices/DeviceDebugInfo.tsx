
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useDeviceGroups } from '@/hooks/useDeviceGroups';

interface DeviceDebugInfoProps {
  organizationId: string;
  totalDevices: number;
  filteredDevices: number;
  searchTerm: string;
  filterStatus: string;
  filterType: string;
  filterGroup?: string;
}

const DeviceDebugInfo = ({
  organizationId,
  totalDevices,
  filteredDevices,
  searchTerm,
  filterStatus,
  filterType,
  filterGroup = 'all'
}: DeviceDebugInfoProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { deviceGroups } = useDeviceGroups(organizationId);

  const selectedGroup = deviceGroups.find(group => group.id === filterGroup);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-md">
      <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium">
        <span>Debug Information</span>
        <span className="text-xs text-muted-foreground">
          {isOpen ? 'Hide Details' : 'Show Details'}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ScrollArea className="h-[200px] p-4">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-xs text-muted-foreground">Organization ID:</div>
              <div className="text-xs font-mono">{organizationId}</div>
              
              <div className="text-xs text-muted-foreground">Total Devices:</div>
              <div className="text-xs">{totalDevices}</div>
              
              <div className="text-xs text-muted-foreground">Filtered Devices:</div>
              <div className="text-xs">{filteredDevices}</div>
              
              <div className="text-xs text-muted-foreground">Search Term:</div>
              <div className="text-xs">
                {searchTerm ? 
                  <Badge variant="outline">{searchTerm}</Badge> : 
                  <span className="text-muted-foreground italic">None</span>
                }
              </div>
              
              <div className="text-xs text-muted-foreground">Status Filter:</div>
              <div className="text-xs">
                <Badge variant="outline">{filterStatus}</Badge>
              </div>
              
              <div className="text-xs text-muted-foreground">Type Filter:</div>
              <div className="text-xs">
                <Badge variant="outline">{filterType}</Badge>
              </div>
              
              <div className="text-xs text-muted-foreground">Group Filter:</div>
              <div className="text-xs">
                {filterGroup === 'all' ? (
                  <Badge variant="outline">All Groups</Badge>
                ) : selectedGroup ? (
                  <Badge variant="outline">{selectedGroup.name}</Badge>
                ) : (
                  <span className="text-muted-foreground italic">Invalid Group</span>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default DeviceDebugInfo;
