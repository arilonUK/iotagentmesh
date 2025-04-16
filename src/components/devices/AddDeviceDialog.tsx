
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddDeviceForm } from './AddDeviceForm';

interface AddDeviceDialogProps {
  onDeviceAdded?: () => void;
}

export function AddDeviceDialog({ onDeviceAdded }: AddDeviceDialogProps) {
  const [open, setOpen] = React.useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onDeviceAdded?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Device
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Device</DialogTitle>
        </DialogHeader>
        <AddDeviceForm 
          onSuccess={handleSuccess}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
