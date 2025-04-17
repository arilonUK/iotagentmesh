
import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ProductProperty, PropertyFormValues } from '@/types/product';
import {
  Dialog,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
} from '@/components/ui/alert-dialog';
import { PlusCircle } from 'lucide-react';
import { 
  PropertyList, 
  PropertyFormDialog, 
  PropertyDeleteDialog 
} from './property-tab';

interface ProductPropertiesTabProps {
  productId: string;
}

export function ProductPropertiesTab({ productId }: ProductPropertiesTabProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<ProductProperty | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingPropertyId, setDeletingPropertyId] = useState<string | null>(null);

  const { 
    getProductProperties,
    createProperty,
    isCreatingProperty,
    updateProperty,
    isUpdatingProperty,
    deleteProperty,
    isDeletingProperty
  } = useProducts();

  const { data: properties, isLoading, error } = getProductProperties(productId);

  // Updated to return a Promise
  const handleAddProperty = async (data: PropertyFormValues): Promise<void> => {
    try {
      console.log("Adding property:", data);
      await createProperty({
        ...data,
        product_id: productId
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding property:", error);
      throw error;
    }
  };

  // Updated to return a Promise
  const handleUpdateProperty = async (data: PropertyFormValues): Promise<void> => {
    if (editingProperty) {
      try {
        console.log("Updating property:", editingProperty.id, data);
        await updateProperty(editingProperty.id, data);
        setIsEditDialogOpen(false);
        setEditingProperty(null);
      } catch (error) {
        console.error("Error updating property:", error);
        throw error;
      }
    }
  };

  // Updated to return a Promise
  const handleDeleteProperty = async (): Promise<void> => {
    if (deletingPropertyId) {
      try {
        console.log("Deleting property:", deletingPropertyId);
        await deleteProperty(deletingPropertyId);
        setDeletingPropertyId(null);
      } catch (error) {
        console.error("Error deleting property:", error);
        throw error;
      }
    }
  };

  const handleEditProperty = (property: ProductProperty) => {
    console.log("Setting editing property:", property);
    setEditingProperty(property);
    setIsEditDialogOpen(true);
  };

  const handleDeletePropertyClick = (propertyId: string) => {
    setDeletingPropertyId(propertyId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Product Properties</h3>
          <p className="text-sm text-muted-foreground">
            Define properties that devices of this product type should have
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <PlusCircle className="h-4 w-4" />
              Add Property
            </Button>
          </DialogTrigger>
          <PropertyFormDialog 
            title="Add Property"
            description="Define a new property for this product template."
            onSubmit={handleAddProperty}
            isLoading={isCreatingProperty}
          />
        </Dialog>
      </div>

      <Separator />

      <PropertyList 
        properties={properties}
        isLoading={isLoading}
        error={error as Error | null}
        productId={productId}
        isEditDialogOpen={isEditDialogOpen}
        isAddDialogOpen={isAddDialogOpen}
        editingPropertyId={editingProperty?.id || null}
        deletingPropertyId={deletingPropertyId}
        onOpenAddDialog={() => setIsAddDialogOpen(true)}
        onEditProperty={handleEditProperty}
        onDeleteProperty={handleDeletePropertyClick}
      />

      {/* Edit Property Dialog */}
      {editingProperty && (
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setEditingProperty(null);
        }}>
          <PropertyFormDialog 
            title="Edit Property" 
            description="Update the details for this property."
            onSubmit={handleUpdateProperty}
            defaultValues={editingProperty}
            isLoading={isUpdatingProperty}
          />
        </Dialog>
      )}

      {/* Delete Property Dialog */}
      {deletingPropertyId && (
        <AlertDialog open={!!deletingPropertyId} onOpenChange={(open) => {
          if (!open) setDeletingPropertyId(null);
        }}>
          <PropertyDeleteDialog 
            onDelete={handleDeleteProperty}
            isDeleting={isDeletingProperty}
          />
        </AlertDialog>
      )}
    </div>
  );
}
