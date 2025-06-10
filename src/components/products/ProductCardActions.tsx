
import React from 'react';
import { EditProductDialog } from './EditProductDialog';
import { DeleteProductDialog } from './DeleteProductDialog';
import { ProductTemplate } from '@/types/product';

interface ProductCardActionsProps {
  product: ProductTemplate;
  onDelete: () => void;
}

export function ProductCardActions({ product, onDelete }: ProductCardActionsProps) {
  return (
    <div 
      className="flex items-center gap-1 flex-shrink-0"
      onClick={(e) => e.stopPropagation()}
    >
      <EditProductDialog product={product} />
      <DeleteProductDialog 
        productId={product.id} 
        productName={product.name} 
        onDelete={onDelete}
      />
    </div>
  );
}
