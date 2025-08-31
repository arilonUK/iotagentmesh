import { useQuery } from '@tanstack/react-query';
import { productServices } from '@/services/products';

export const useProductProperties = (productId: string) => {
  return useQuery({
    queryKey: ['productProperties', productId],
    queryFn: () => productServices.fetchProductProperties(productId),
    enabled: !!productId,
  });
};