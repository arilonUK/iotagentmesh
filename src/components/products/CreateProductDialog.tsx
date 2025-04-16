
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { ProductForm } from './ProductForm';
import { useProducts } from '@/hooks/useProducts';
import { useOrganization } from '@/contexts/organization';

export function CreateProductDialog() {
  const [open, setOpen] = React.useState(false);
  const { createProduct, isCreating } = useProducts();
  const { organization } = useOrganization();

  const handleSubmit = async (data: any) => {
    try {
      if (organization) {
        await createProduct({
          ...data,
          organization_id: organization.id,
        });
        setOpen(false);
      }
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" />
          New Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-background border border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Create New Product</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <ProductForm onSubmit={handleSubmit} isLoading={isCreating} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
