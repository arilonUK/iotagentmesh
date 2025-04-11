
import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { useDataBuckets } from '@/hooks/useDataBuckets';
import { useDevices } from '@/hooks/useDevices';
import { DataBucketConfig, DataBucketFormData } from '@/types/dataBucket';
import DataBucketList from '@/components/dataBuckets/DataBucketList';
import DataBucketForm from '@/components/dataBuckets/DataBucketForm';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Plus, DatabaseZap } from 'lucide-react';

const DataBuckets = () => {
  const { organization } = useAuth();
  const { 
    buckets, 
    isLoading, 
    createBucket, 
    updateBucket, 
    deleteBucket,
    isCreating,
    isUpdating,
    isDeleting
  } = useDataBuckets(organization?.id);
  
  const { devices, isLoading: isLoadingDevices } = useDevices(organization?.id);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentBucket, setCurrentBucket] = useState<DataBucketConfig | null>(null);
  const [bucketToDelete, setBucketToDelete] = useState<string | null>(null);
  
  const deviceOptions = devices.map(device => ({
    id: device.id,
    name: device.name
  }));
  
  const handleCreateBucket = () => {
    setCurrentBucket(null);
    setIsFormOpen(true);
  };
  
  const handleEditBucket = (bucket: DataBucketConfig) => {
    setCurrentBucket(bucket);
    setIsFormOpen(true);
  };
  
  const handleDeleteBucket = (bucketId: string) => {
    setBucketToDelete(bucketId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (bucketToDelete) {
      deleteBucket(bucketToDelete);
    }
    setIsDeleteDialogOpen(false);
    setBucketToDelete(null);
  };
  
  const handleSubmit = (data: DataBucketFormData) => {
    if (currentBucket) {
      updateBucket(currentBucket.id, data);
    } else {
      createBucket(data);
    }
    setIsFormOpen(false);
  };
  
  if (!organization) {
    return (
      <div className="container max-w-7xl py-10">
        <div className="text-center">
          No organization selected. Please select an organization to manage data buckets.
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-7xl py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <DatabaseZap className="mr-2 h-8 w-8" />
            Data Buckets
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure where your IoT device data is stored and processed
          </p>
        </div>
        <Button onClick={handleCreateBucket}>
          <Plus className="mr-2 h-4 w-4" />
          New Data Bucket
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-10">Loading data buckets...</div>
      ) : (
        <DataBucketList
          buckets={buckets}
          onEdit={handleEditBucket}
          onDelete={handleDeleteBucket}
          isDeleting={isDeleting}
        />
      )}
      
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {currentBucket ? 'Edit Data Bucket' : 'Create Data Bucket'}
            </SheetTitle>
            <SheetDescription>
              Configure where and how your device data will be stored
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <DataBucketForm
              initialData={currentBucket || undefined}
              onSubmit={handleSubmit}
              isSubmitting={isCreating || isUpdating}
              deviceOptions={deviceOptions}
            />
          </div>
        </SheetContent>
      </Sheet>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this data bucket and all its configuration.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DataBuckets;
