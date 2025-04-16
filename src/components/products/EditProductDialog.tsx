
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
  const { updateProduct } = useProducts();

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
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <ProductForm onSubmit={handleSubmit} defaultValues={product} isLoading={false} />
      </DialogContent>
    </Dialog>
  );
}
