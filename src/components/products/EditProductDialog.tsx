
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
import { Pencil } from 'lucide-react';
import { ProductForm } from './ProductForm';
import { useProducts } from '@/hooks/useProducts';
import { ProductTemplate } from '@/types/product';
import { toast } from 'sonner';

interface EditProductDialogProps {
  product: ProductTemplate;
}

export function EditProductDialog({ product }: EditProductDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { updateProduct, isUpdating } = useProducts();

  const handleSubmit = async (data: Partial<ProductTemplate>) => {
    try {
      console.log('Submitting product update:', data);
      
      // Ensure we're not trying to update organization_id or other readonly fields
      const updateData = {
        name: data.name,
        description: data.description,
        version: data.version,
        category: data.category,
        tags: data.tags,
        status: data.status,
      };
      
      console.log('Submitting sanitized product update:', updateData);
      await updateProduct(product.id, updateData);
      setOpen(false);
    } catch (error) {
      console.error('Error updating product in dialog:', error);
      toast.error('Failed to update product');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="hover:bg-accent"
          title="Edit product"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update the details for your product template "{product.name}".
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <ProductForm 
            onSubmit={handleSubmit} 
            defaultValues={product} 
            isLoading={isUpdating} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
