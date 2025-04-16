
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productServices } from '@/services/products';
import { useOrganization } from '@/contexts/organization';
import { ProductTemplate, ProductProperty } from '@/types/product';
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
    mutationFn: (productData: Omit<ProductTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating product with mutation:', productData);
      
      // Ensure organization_id is set and valid
      if (!productData.organization_id) {
        console.error('Organization ID is missing in product data');
        if (organization?.id) {
          console.log('Using organization ID from context:', organization.id);
          productData.organization_id = organization.id;
        } else {
          const error = new Error('Organization ID is required for creating a product and none is available');
          console.error(error);
          throw error;
        }
      }
      
      console.log('Proceeding with organization_id:', productData.organization_id);
      return productServices.createProduct(productData);
    },
    onSuccess: (data) => {
      console.log('Product created successfully, invalidating queries with result:', data);
      queryClient.invalidateQueries({ queryKey: ['products', organization?.id] });
      toast.success('Product created successfully');
    },
    onError: (error) => {
      console.error('Error creating product in mutation:', error);
      toast.error(`Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  // Product Properties
  const getProductProperties = (productId: string) => useQuery({
    queryKey: ['productProperties', productId],
    queryFn: () => productServices.fetchProductProperties(productId),
    enabled: !!productId,
  });

  const createPropertyMutation = useMutation({
    mutationFn: productServices.createProductProperty,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['productProperties', variables.product_id] });
      toast.success('Property added successfully');
    },
    onError: (error) => {
      console.error('Error creating property:', error);
      toast.error('Failed to add property');
    }
  });

  const updatePropertyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductProperty> }) =>
      productServices.updateProductProperty(id, data),
    onSuccess: (_data, variables) => {
      // We need to get the product_id from the cache to invalidate queries
      const productProperty = queryClient.getQueryData<ProductProperty[]>(['productProperties'])?.find(
        (prop) => prop.id === variables.id
      );
      if (productProperty) {
        queryClient.invalidateQueries({ queryKey: ['productProperties', productProperty.product_id] });
      }
      toast.success('Property updated successfully');
    },
    onError: (error) => {
      console.error('Error updating property:', error);
      toast.error('Failed to update property');
    }
  });

  const deletePropertyMutation = useMutation({
    mutationFn: productServices.deleteProductProperty,
    onSuccess: (_data, id) => {
      // We need to get the product_id from the cache to invalidate queries
      const productProperty = queryClient.getQueryData<ProductProperty[]>(['productProperties'])?.find(
        (prop) => prop.id === id
      );
      if (productProperty) {
        queryClient.invalidateQueries({ queryKey: ['productProperties', productProperty.product_id] });
      }
      toast.success('Property deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    }
  });

  return {
    // Products
    products,
    isLoading,
    error,
    // Create operation
    createProduct: createProductMutation.mutate,
    isCreating: createProductMutation.isPending,
    // Update operation
    updateProduct: (id: string, data: Partial<ProductTemplate>) =>
      updateProductMutation.mutate({ id, data }),
    isUpdating: updateProductMutation.isPending,
    // Delete operation
    deleteProduct: deleteProductMutation.mutate,
    isDeleting: deleteProductMutation.isPending,
    // Properties
    getProductProperties,
    createProperty: createPropertyMutation.mutate,
    isCreatingProperty: createPropertyMutation.isPending,
    updateProperty: (id: string, data: Partial<ProductProperty>) =>
      updatePropertyMutation.mutate({ id, data }),
    isUpdatingProperty: updatePropertyMutation.isPending,
    deleteProperty: deletePropertyMutation.mutate,
    isDeletingProperty: deletePropertyMutation.isPending
  };
}
