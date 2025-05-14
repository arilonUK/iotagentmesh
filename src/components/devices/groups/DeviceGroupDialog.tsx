
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DeviceGroupForm } from './DeviceGroupForm';
import { DeviceGroupFormData } from '@/types/deviceGroup';

interface DeviceGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DeviceGroupFormData) => void;
  title: string;
  description: string;
  defaultValues?: DeviceGroupFormData;
  isLoading?: boolean;
}

export function DeviceGroupDialog({
  open,
  onOpenChange,
  onSubmit,
  title,
  description,
  defaultValues,
  isLoading
}: DeviceGroupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DeviceGroupForm 
          onSubmit={onSubmit} 
          defaultValues={defaultValues} 
          isLoading={isLoading} 
        />
      </DialogContent>
    </Dialog>
  );
}
