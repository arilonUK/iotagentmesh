
import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { useDeviceGroups } from '@/hooks/useDeviceGroups';
import { useOrganization } from '@/contexts/organization';
import { Loader2, Plus } from 'lucide-react';
import { DeviceGroupForm } from './DeviceGroupForm';
import { DeviceGroupFormData } from '@/types/deviceGroup';

interface DeviceGroupSelectorProps {
  onSelect: (groupId: string) => void;
  selectedGroupId?: string;
  placeholder?: string;
  className?: string;
}

export function DeviceGroupSelector({
  onSelect,
  selectedGroupId,
  placeholder = "Filter by group",
  className
}: DeviceGroupSelectorProps) {
  const { organization } = useOrganization();
  const { deviceGroups, isLoading, createGroup, isCreating } = useDeviceGroups(organization?.id);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const handleCreateGroup = (data: DeviceGroupFormData) => {
    createGroup(data, {
      onSuccess: (newGroup) => {
        if (newGroup) {
          onSelect(newGroup.id);
          setCreateDialogOpen(false);
          toast({
            title: 'Group created',
            description: `Group "${data.name}" created successfully.`
          });
        }
      }
    });
  };
  
  return (
    <>
      <div className={`flex ${className}`}>
        <Select value={selectedGroupId} onValueChange={onSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            {isLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </div>
            ) : deviceGroups.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-2">
                No groups found
              </div>
            ) : (
              deviceGroups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name} ({group.device_count || 0})
                </SelectItem>
              ))
            )}
            <div className="border-t px-2 py-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-sm" 
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Group
              </Button>
            </div>
          </SelectContent>
        </Select>
      </div>
      
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Device Group</DialogTitle>
            <DialogDescription>
              Create a new group to organize your devices
            </DialogDescription>
          </DialogHeader>
          <DeviceGroupForm 
            onSubmit={handleCreateGroup} 
            isLoading={isCreating} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
