
import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { ProductProperty, PropertyFormValues } from '@/types/product';
import ProductPropertyForm from './ProductPropertyForm';
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
import { Badge } from '@/components/ui/badge';
import { Loader2, PlusCircle, Trash, Pencil } from 'lucide-react';
import { toast } from 'sonner';

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
    createProperty({
      ...data,
      product_id: productId
    });
    setIsAddDialogOpen(false);
  };

  // Updated to return a Promise
  const handleUpdateProperty = async (data: PropertyFormValues): Promise<void> => {
    if (editingProperty) {
      updateProperty(editingProperty.id, data);
      setIsEditDialogOpen(false);
      setEditingProperty(null);
    }
  };

  // Updated to return a Promise
  const handleDeleteProperty = async (): Promise<void> => {
    if (deletingPropertyId) {
      deleteProperty(deletingPropertyId);
      setDeletingPropertyId(null);
    }
  };

  const getDataTypeLabel = (type: string) => {
    switch (type) {
      case 'string':
        return 'Text';
      case 'number':
        return 'Number';
      case 'boolean':
        return 'Boolean';
      case 'location':
        return 'Location';
      default:
        return type;
    }
  };

  const getDataTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'string':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'number':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'boolean':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'location':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading properties...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error loading properties</CardTitle>
          <CardDescription>
            There was a problem loading the product properties.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please try again later or contact support if the problem persists.</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

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
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Property</DialogTitle>
              <DialogDescription>
                Define a new property for this product template.
              </DialogDescription>
            </DialogHeader>
            <ProductPropertyForm
              onSubmit={handleAddProperty}
              isLoading={isCreatingProperty}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      {(!properties || properties.length === 0) ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No properties defined</CardTitle>
            <CardDescription>
              This product template doesn't have any properties yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Properties define the attributes that devices of this type will have,
              such as sensors, configurations, and state variables.
            </p>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1">
                  <PlusCircle className="h-4 w-4" />
                  Add First Property
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add Property</DialogTitle>
                  <DialogDescription>
                    Define a new property for this product template.
                  </DialogDescription>
                </DialogHeader>
                <ProductPropertyForm
                  onSubmit={handleAddProperty}
                  isLoading={isCreatingProperty}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map(property => (
            <Card key={property.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{property.name}</CardTitle>
                    <Badge
                      variant="secondary"
                      className={`mt-1 ${getDataTypeBadgeColor(property.data_type)}`}
                    >
                      {getDataTypeLabel(property.data_type)}
                      {property.unit && ` (${property.unit})`}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                {property.description && (
                  <p className="text-sm text-muted-foreground">
                    {property.description}
                  </p>
                )}
                {property.is_required && (
                  <Badge className="mt-2 bg-red-100 text-red-800 hover:bg-red-100">Required</Badge>
                )}
                {property.validation_rules && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {property.validation_rules.min !== undefined && property.validation_rules.max !== undefined && (
                      <div>Range: {property.validation_rules.min} to {property.validation_rules.max}</div>
                    )}
                    {property.validation_rules.pattern && (
                      <div>Pattern: {property.validation_rules.pattern}</div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pb-2">
                <Dialog open={isEditDialogOpen && editingProperty?.id === property.id} onOpenChange={(open) => {
                  setIsEditDialogOpen(open);
                  if (!open) setEditingProperty(null);
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="gap-1"
                      onClick={() => setEditingProperty(property)}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  {editingProperty && (
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Edit Property</DialogTitle>
                        <DialogDescription>
                          Update the details for this property.
                        </DialogDescription>
                      </DialogHeader>
                      <ProductPropertyForm
                        onSubmit={handleUpdateProperty}
                        defaultValues={editingProperty}
                        isLoading={isUpdatingProperty}
                      />
                    </DialogContent>
                  )}
                </Dialog>
                <AlertDialog open={deletingPropertyId === property.id} onOpenChange={(open) => {
                  if (!open) setDeletingPropertyId(null);
                }}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive gap-1"
                      onClick={() => setDeletingPropertyId(property.id)}
                    >
                      <Trash className="h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Property</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this property? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleDeleteProperty}
                        disabled={isDeletingProperty}
                      >
                        {isDeletingProperty ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          'Delete'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
