
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProductForm } from './ProductForm';
import { useProducts } from '@/hooks/useProducts';
import { useOrganization } from '@/contexts/organization';
import { toast } from 'sonner';

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
        toast.success('Product created successfully');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="default">
          <Plus className="mr-2 h-4 w-4" />
          New Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <ProductForm onSubmit={handleSubmit} isLoading={isCreating} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
