
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productServices } from '@/services/products';
import { useOrganization } from '@/contexts/organization';
import { ProductTemplate, ProductProperty, ProductService, ServiceFormValues, PropertyFormValues, PropertyTemplate } from '@/types/product';
import { toast } from 'sonner';

export function useProducts() {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();

  // Product Template Queries & Mutations
  const {
    data: products,
    isLoading,
    error
  } = useQuery({
    queryKey: ['products', organization?.id],
    queryFn: () => organization?.id ? productServices.fetchProducts(organization.id) : Promise.resolve([]),
    enabled: !!organization?.id,
  });

  const getProductById = (productId: string) => useQuery({
    queryKey: ['product', productId],
    queryFn: () => productServices.fetchProduct(productId),
    enabled: !!productId,
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
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductTemplate> }) => {
      console.log('Updating product with mutation:', id, data);
      return productServices.updateProduct(id, data);
    },
    onSuccess: (data) => {
      console.log('Product updated successfully with result:', data);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', data.id] });
      toast.success('Product updated successfully');
    },
    onError: (error) => {
      console.error('Error updating product in mutation:', error);
      toast.error(`Failed to update product: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  // Product Properties Queries & Mutations
  const getProductProperties = (productId: string) => useQuery({
    queryKey: ['productProperties', productId],
    queryFn: () => productServices.fetchProductProperties(productId),
    enabled: !!productId,
  });

  const createPropertyMutation = useMutation({
    mutationFn: (propertyData: PropertyFormValues) => {
      console.log('Creating property with mutation:', propertyData);
      return productServices.createProductProperty(propertyData);
    },
    onSuccess: (data, variables) => {
      console.log('Property created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['productProperties', variables.product_id] });
      toast.success('Property added successfully');
    },
    onError: (error) => {
      console.error('Error creating property in mutation:', error);
      toast.error(`Failed to add property: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const updatePropertyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductProperty> }) => {
      console.log('Updating property with mutation:', id, data);
      return productServices.updateProductProperty(id, data);
    },
    onSuccess: (data) => {
      console.log('Property updated successfully:', data);
      if (data.product_id) {
        queryClient.invalidateQueries({ queryKey: ['productProperties', data.product_id] });
      }
      toast.success('Property updated successfully');
    },
    onError: (error) => {
      console.error('Error updating property in mutation:', error);
      toast.error(`Failed to update property: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const deletePropertyMutation = useMutation({
    mutationFn: productServices.deleteProductProperty,
    onSuccess: (_data, id) => {
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

  // Property Templates Queries & Mutations
  const getPropertyTemplates = () => useQuery({
    queryKey: ['propertyTemplates', organization?.id],
    queryFn: () => organization?.id ? productServices.fetchPropertyTemplates(organization.id) : Promise.resolve([]),
    enabled: !!organization?.id,
  });

  const createTemplateMutation = useMutation({
    mutationFn: productServices.createPropertyTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propertyTemplates', organization?.id] });
      toast.success('Property template created successfully');
    },
    onError: (error) => {
      console.error('Error creating property template:', error);
      toast.error('Failed to create property template');
    }
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PropertyTemplate> }) => productServices.updatePropertyTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propertyTemplates', organization?.id] });
      toast.success('Property template updated successfully');
    },
    onError: (error) => {
      console.error('Error updating property template:', error);
      toast.error('Failed to update property template');
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: productServices.deletePropertyTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propertyTemplates', organization?.id] });
      toast.success('Property template deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting property template:', error);
      toast.error('Failed to delete property template');
    }
  });

  const applyTemplateMutation = useMutation({
    mutationFn: ({ templateId, productId }: { templateId: string; productId: string }) => 
      productServices.applyTemplateToProduct(templateId, productId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['productProperties', variables.productId] });
      toast.success('Property template applied successfully');
    },
    onError: (error) => {
      console.error('Error applying property template:', error);
      toast.error('Failed to apply property template');
    }
  });

  // Product Services Queries & Mutations
  const getProductServices = (productId: string) => useQuery({
    queryKey: ['productServices', productId],
    queryFn: () => productServices.fetchProductServices(productId),
    enabled: !!productId,
  });

  const createServiceMutation = useMutation({
    mutationFn: (serviceData: ServiceFormValues & { product_id: string; organization_id: string }) => {
      console.log('Creating service with mutation:', serviceData);
      return productServices.createProductService(serviceData);
    },
    onSuccess: (data, variables) => {
      console.log('Service created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['productServices', variables.product_id] });
      toast.success('Service added successfully');
    },
    onError: (error) => {
      console.error('Error creating service in mutation:', error);
      toast.error(`Failed to add service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductService> }) => {
      console.log('Updating service with mutation:', id, data);
      return productServices.updateProductService(id, data);
    },
    onSuccess: (data) => {
      console.log('Service updated successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['productServices', data.product_id] });
      toast.success('Service updated successfully');
    },
    onError: (error) => {
      console.error('Error updating service in mutation:', error);
      toast.error(`Failed to update service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const deleteServiceMutation = useMutation({
    mutationFn: productServices.deleteProductService,
    onSuccess: (_data, id) => {
      // Get the service's product_id from the cache
      const services = queryClient.getQueryData<ProductService[]>(['productServices']);
      const service = services?.find(s => s.id === id);
      if (service) {
        queryClient.invalidateQueries({ queryKey: ['productServices', service.product_id] });
      } else {
        // If we can't find the specific service, invalidate all product services
        queryClient.invalidateQueries({ queryKey: ['productServices'] });
      }
      toast.success('Service deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  });

  const toggleServiceMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => {
      console.log('Toggling service activation:', id, enabled);
      return productServices.toggleServiceActivation(id, enabled);
    },
    onSuccess: (data) => {
      console.log('Service activation toggled successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['productServices', data.product_id] });
      toast.success(`Service ${data.enabled ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error) => {
      console.error('Error toggling service activation:', error);
      toast.error(`Failed to update service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  return {
    // Basic product operations
    products,
    isLoading,
    error,
    getProductById,
    createProduct: createProductMutation.mutate,
    isCreating: createProductMutation.isPending,
    updateProduct: (id: string, data: Partial<ProductTemplate>) => {
      console.log('Calling updateProduct with:', id, data);
      return updateProductMutation.mutate({ id, data });
    },
    isUpdating: updateProductMutation.isPending,
    deleteProduct: deleteProductMutation.mutate,
    isDeleting: deleteProductMutation.isPending,

    // Property operations
    getProductProperties,
    createProperty: createPropertyMutation.mutate,
    isCreatingProperty: createPropertyMutation.isPending,
    updateProperty: (id: string, data: Partial<ProductProperty>) => {
      console.log('Calling updateProperty with:', id, data);
      return updatePropertyMutation.mutate({ id, data });
    },
    isUpdatingProperty: updatePropertyMutation.isPending,
    deleteProperty: deletePropertyMutation.mutate,
    isDeletingProperty: deletePropertyMutation.isPending,

    // Property template operations
    getPropertyTemplates,
    createPropertyTemplate: createTemplateMutation.mutate,
    isCreatingTemplate: createTemplateMutation.isPending,
    updatePropertyTemplate: (id: string, data: Partial<PropertyTemplate>) => updateTemplateMutation.mutate({ id, data }),
    isUpdatingTemplate: updateTemplateMutation.isPending,
    deletePropertyTemplate: deleteTemplateMutation.mutate,
    isDeletingTemplate: deleteTemplateMutation.isPending,
    applyPropertyTemplate: (templateId: string, productId: string) => 
      applyTemplateMutation.mutate({ templateId, productId }),
    isApplyingTemplate: applyTemplateMutation.isPending,

    // Service operations
    getProductServices,
    createProductService: createServiceMutation.mutate,
    isCreatingProductService: createServiceMutation.isPending,
    updateProductService: (id: string, data: Partial<ServiceFormValues>) => {
      console.log('Calling updateProductService with:', id, data);
      return updateServiceMutation.mutate({ id, data });
    },
    isUpdatingProductService: updateServiceMutation.isPending,
    deleteProductService: deleteServiceMutation.mutate,
    isDeletingProductService: deleteServiceMutation.isPending,
    toggleServiceActivation: (id: string, enabled: boolean) => 
      toggleServiceMutation.mutate({ id, enabled }),
    isTogglingService: toggleServiceMutation.isPending
  };
}
