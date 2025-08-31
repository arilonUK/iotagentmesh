import { useQuery } from '@tanstack/react-query';
import { productServices } from '@/services/products';

export const useProductById = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => productServices.fetchProduct(productId),
    enabled: !!productId,
  });
};