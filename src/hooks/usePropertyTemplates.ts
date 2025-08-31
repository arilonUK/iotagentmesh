import { useQuery } from '@tanstack/react-query';
import { productServices } from '@/services/products';
import { useOrganization } from '@/contexts/organization';

export const usePropertyTemplates = () => {
  const { organization } = useOrganization();
  
  return useQuery({
    queryKey: ['propertyTemplates', organization?.id],
    queryFn: () => organization?.id ? productServices.fetchPropertyTemplates(organization.id) : Promise.resolve([]),
    enabled: !!organization?.id,
  });
};