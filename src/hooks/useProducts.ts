
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productServices } from '@/services/productService';
import { useOrganization } from '@/contexts/organization';
import { ProductTemplate } from '@/types/product';
import { toast } from 'sonner';

export function useProducts() {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();

  const {
    data: products,
    isLoading,
    error
  } = useQuery({
    queryKey: ['products', organization?.id],
    queryFn: () => organization?.id ? productServices.fetchProducts(organization.id) : Promise.resolve([]),
    enabled: !!organization?.id,
  });

  const createProductMutation = useMutation({
    mutationFn: productServices.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductTemplate> }) =>
      productServices.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: productServices.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  });

  return {
    products,
    isLoading,
    error,
    createProduct: createProductMutation.mutate,
    updateProduct: (id: string, data: Partial<ProductTemplate>) =>
      updateProductMutation.mutate({ id, data }),
    deleteProduct: deleteProductMutation.mutate
  };
}
