
import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ProductService, ServiceFormValues } from '@/types/product';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PlusCircle } from 'lucide-react';
import { ServiceForm, ServiceList } from './services';
import { useToast } from '@/hooks/use-toast';

interface ProductServicesTabProps {
  productId: string;
}

export function ProductServicesTab({ productId }: ProductServicesTabProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ProductService | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);
  const { toast } = useToast();

  const { 
    getProductServices,
    createProductService,
    isCreatingProductService,
    updateProductService,
    isUpdatingProductService,
    deleteProductService,
    isDeletingProductService,
    toggleServiceActivation,
    isTogglingService,
    getProductById
  } = useProducts();

  const { data: product } = getProductById(productId);
  const { data: services, isLoading } = getProductServices(productId);

  const handleAddService = async (data: ServiceFormValues): Promise<void> => {
    try {
      if (!product) {
        toast({
          title: "Error",
          description: "Product information is missing",
          variant: "destructive"
        });
        return;
      }
      
      await createProductService({
        ...data,
        product_id: productId,
        organization_id: product.organization_id
      });
      
      setIsAddDialogOpen(false);
      toast({
        title: "Service created",
        description: `Service "${data.name}" has been created successfully`
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while creating the service';
      toast({
        title: "Error creating service",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleUpdateService = async (data: ServiceFormValues): Promise<void> => {
    if (!editingService) return;
    
    try {
      await updateProductService(editingService.id, data);
      setEditingService(null);
      toast({
        title: "Service updated",
        description: `Service "${data.name}" has been updated successfully`
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while updating the service';
      toast({
        title: "Error updating service",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleDeleteService = async (): Promise<void> => {
    if (!deletingServiceId) return;
    
    try {
      await deleteProductService(deletingServiceId);
      setDeletingServiceId(null);
      toast({
        title: "Service deleted",
        description: "Service has been deleted successfully"
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while deleting the service';
      toast({
        title: "Error deleting service",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleToggleService = async (serviceId: string, enabled: boolean): Promise<void> => {
    try {
      await toggleServiceActivation(serviceId, enabled);
      toast({
        title: enabled ? "Service activated" : "Service deactivated",
        description: `Service has been ${enabled ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while toggling the service';
      toast({
        title: "Error toggling service",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Product Services</h3>
          <p className="text-sm text-muted-foreground">
            Configure services that devices of this product type will use
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <PlusCircle className="h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Service</DialogTitle>
              <DialogDescription>
                Configure a new service for this product template.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <ServiceForm 
                onSubmit={handleAddService}
                isLoading={isCreatingProductService}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      <ServiceList 
        services={services || []}
        isLoading={isLoading}
        onEdit={(service) => setEditingService(service)}
        onDelete={(serviceId) => setDeletingServiceId(serviceId)}
        onToggle={handleToggleService}
      />

      {/* Edit Service Dialog */}
      {editingService && (
        <Dialog 
          open={!!editingService} 
          onOpenChange={(open) => {
            if (!open) setEditingService(null);
          }}
        >
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
              <DialogDescription>
                Update configuration for "{editingService.name}"
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <ServiceForm 
                onSubmit={handleUpdateService}
                defaultValues={editingService}
                isLoading={isUpdatingProductService}
                isEditing={true}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Service Dialog */}
      <AlertDialog 
        open={!!deletingServiceId} 
        onOpenChange={(open) => {
          if (!open) setDeletingServiceId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this service? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDeleteService();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeletingProductService}
            >
              {isDeletingProductService ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
