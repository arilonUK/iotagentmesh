
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productServices } from '@/services/productService';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ProductPropertiesTab } from '@/components/products/ProductPropertiesTab';
import { Badge } from '@/components/ui/badge';
import { EditProductDialog } from '@/components/products/EditProductDialog';
import { DeleteProductDialog } from '@/components/products/DeleteProductDialog';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => id ? productServices.fetchProduct(id) : Promise.reject('No product ID'),
    enabled: !!id,
  });

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'archived':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      case 'draft':
      default:
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/products')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <Skeleton className="h-[500px] w-full mt-8" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto py-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/products')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading product</AlertTitle>
          <AlertDescription>
            The requested product could not be found or there was an error loading it.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/dashboard/products')}>
          Return to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/products')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <Badge className={getStatusBadgeColor(product.status)}>
              {product.status || 'Draft'}
            </Badge>
          </div>
          <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
            <span>Version {product.version}</span>
            {product.category && (
              <span>• {product.category}</span>
            )}
          </div>
          {product.description && (
            <p className="mt-3">{product.description}</p>
          )}
        </div>

        <div className="flex gap-2">
          <EditProductDialog product={product} />
          <DeleteProductDialog 
            productId={product.id} 
            productName={product.name}
            onDelete={() => navigate('/dashboard/products')} 
          />
        </div>
      </div>

      <Tabs defaultValue="properties" className="mt-8">
        <TabsList>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="buckets">Data Buckets</TabsTrigger>
        </TabsList>
        <TabsContent value="properties" className="mt-6">
          <ProductPropertiesTab productId={product.id} />
        </TabsContent>
        <TabsContent value="dashboards">
          <div className="text-center py-8 text-muted-foreground">
            <p>Dashboard management will be implemented in the next phase</p>
          </div>
        </TabsContent>
        <TabsContent value="services">
          <div className="text-center py-8 text-muted-foreground">
            <p>Service configuration will be implemented in the next phase</p>
          </div>
        </TabsContent>
        <TabsContent value="buckets">
          <div className="text-center py-8 text-muted-foreground">
            <p>Data bucket configuration will be implemented in the next phase</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
