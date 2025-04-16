
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { ProductForm } from './ProductForm';
import { useProducts } from '@/hooks/useProducts';
import { ProductTemplate } from '@/types/product';

interface EditProductDialogProps {
  product: ProductTemplate;
}

export function EditProductDialog({ product }: EditProductDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { updateProduct, isUpdating } = useProducts();

  const handleSubmit = async (data: Partial<ProductTemplate>) => {
    try {
      await updateProduct(product.id, data);
      setOpen(false);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-accent" title="Edit product">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-background border border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Edit Product</DialogTitle>
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
