import { useQuery } from '@tanstack/react-query';
import { productServices } from '@/services/products';

export const useProductServices = (productId: string) => {
  return useQuery({
    queryKey: ['productServices', productId],
    queryFn: () => productServices.fetchProductServices(productId),
    enabled: !!productId,
  });
};