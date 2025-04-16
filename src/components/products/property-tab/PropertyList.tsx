
import React from 'react';
import { ProductProperty } from '@/types/product';
import { PropertyCard } from './PropertyCard';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';

interface PropertyListProps {
  properties: ProductProperty[] | undefined;
  isLoading: boolean;
  error: Error | null;
  productId: string;
  isEditDialogOpen: boolean;
  isAddDialogOpen: boolean;
  editingPropertyId: string | null;
  deletingPropertyId: string | null;
  onOpenAddDialog: () => void;
  onEditProperty: (property: ProductProperty) => void;
  onDeleteProperty: (id: string) => void;
}

export function PropertyList({
  properties,
  isLoading,
  error,
  isEditDialogOpen,
  isAddDialogOpen,
  editingPropertyId,
  deletingPropertyId,
  onOpenAddDialog,
  onEditProperty,
  onDeleteProperty
}: PropertyListProps) {
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

  if (!properties || properties.length === 0) {
    return (
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
          <Dialog open={isAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1" onClick={onOpenAddDialog}>
                <PlusCircle className="h-4 w-4" />
                Add First Property
              </Button>
            </DialogTrigger>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {properties.map(property => (
        <PropertyCard
          key={property.id}
          property={property}
          onEdit={onEditProperty}
          onDelete={onDeleteProperty}
          isEditDialogOpen={isEditDialogOpen}
          editingPropertyId={editingPropertyId}
          deletingPropertyId={deletingPropertyId}
        />
      ))}
    </div>
  );
}
