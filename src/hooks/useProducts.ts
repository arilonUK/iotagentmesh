
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

  return {
    products,
    isLoading,
    error,
    createProduct: createProductMutation.mutate
  };
}
