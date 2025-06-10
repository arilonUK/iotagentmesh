import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateProductDialog } from './CreateProductDialog';
import { ProductCardActions } from './ProductCardActions';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useOrganization } from '@/contexts/organization';

export function ProductList() {
  console.log('ProductList rendered');
  const { products, isLoading, error } = useProducts();
  const navigate = useNavigate();
  const { organization } = useOrganization();

  console.log('Organization:', organization);
  console.log('Products:', products);
  console.log('Loading:', isLoading);
  console.log('Error:', error);

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

  const handleProductClick = (productId: string) => {
    navigate(`/dashboard/products/${productId}`);
  };

  const handleProductDelete = () => {
    // Refresh product list after deletion
    // This is handled by the useProducts hook's mutation onSuccess callback
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Products</h2>
          <CreateProductDialog />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-3/4" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-9 w-9 rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-4 w-1/3 mt-1" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Products</h2>
          <CreateProductDialog />
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading products</AlertTitle>
          <AlertDescription>
            There was a problem loading your products. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products</h2>
        <CreateProductDialog />
      </div>

      {!products || products.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <h3 className="text-lg font-medium">No products found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by creating your first product
            </p>
            <CreateProductDialog />
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card 
              key={product.id} 
              className="flex flex-col cursor-pointer hover:border-primary/50 transition-all relative overflow-hidden"
              onClick={() => handleProductClick(product.id)}
            >
              <CardHeader className="flex-1 pb-3">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold mb-2 text-foreground">
                        {product.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        Version {product.version}
                      </CardDescription>
                    </div>
                    <ProductCardActions 
                      product={product} 
                      onDelete={handleProductDelete}
                    />
                  </div>
                  {product.status && (
                    <Badge className={`w-fit ${getStatusBadgeColor(product.status)}`}>
                      {product.status}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {product.description || "No description provided"}
                </p>
                {product.category && (
                  <p className="text-xs text-muted-foreground">
                    Category: {product.category}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
