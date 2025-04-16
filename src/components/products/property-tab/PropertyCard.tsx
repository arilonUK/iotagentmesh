
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { ProductProperty } from '@/types/product';
import { 
  Dialog,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';

interface PropertyCardProps {
  property: ProductProperty;
  onEdit: (property: ProductProperty) => void;
  onDelete: (id: string) => void;
  isEditDialogOpen: boolean;
  editingPropertyId: string | null;
  deletingPropertyId: string | null;
}

export function PropertyCard({
  property,
  onEdit,
  onDelete,
  isEditDialogOpen,
  editingPropertyId,
  deletingPropertyId
}: PropertyCardProps) {

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

  return (
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
        <Dialog open={isEditDialogOpen && editingPropertyId === property.id}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="gap-1"
              onClick={() => onEdit(property)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </DialogTrigger>
        </Dialog>
        <AlertDialog open={deletingPropertyId === property.id}>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-destructive gap-1"
              onClick={() => onDelete(property.id)}
            >
              <Trash className="h-4 w-4" />
              Delete
            </Button>
          </AlertDialogTrigger>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
