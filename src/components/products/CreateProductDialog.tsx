
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
      if (!organization) {
        console.error('No organization selected');
        toast.error('No organization selected');
        return;
      }
      
      console.log('Submitting product data with organization:', {
        ...data,
        organization_id: organization.id,
      });
      
      await createProduct({
        ...data,
        organization_id: organization.id,
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="default" className="gap-2">
          <Plus className="h-4 w-4" />
          New Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
          <DialogDescription>
            Define the details for your new product template. You can add properties, services, and other configurations later.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <ProductForm onSubmit={handleSubmit} isLoading={isCreating} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
