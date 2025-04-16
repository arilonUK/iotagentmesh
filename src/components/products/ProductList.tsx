
import React from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateProductDialog } from './CreateProductDialog';
import { EditProductDialog } from './EditProductDialog';
import { DeleteProductDialog } from './DeleteProductDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';

export function ProductList() {
  const { products, isLoading, error } = useProducts();
  const [searchTerm, setSearchTerm] = React.useState('');

  // Filter products based on search term
  const filteredProducts = React.useMemo(() => {
    if (!products) return [];
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

  // Loading state with skeletons
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Products</h2>
          <div className="w-32 h-10"><Skeleton className="h-10 w-full" /></div>
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

  // Error state with descriptive alert
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
            There was a problem loading your products. Please try again later or contact support if the issue persists.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasProducts = filteredProducts.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products</h2>
        <CreateProductDialog />
      </div>
      
      {/* Search input */}
      <div className="mb-4">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Empty state */}
      {products && products.length === 0 && (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <h3 className="text-lg font-medium">No products found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by creating your first product
            </p>
            <CreateProductDialog />
          </div>
        </Card>
      )}

      {/* Search no results state */}
      {products && products.length > 0 && filteredProducts.length === 0 && (
        <Alert>
          <AlertTitle>No results found</AlertTitle>
          <AlertDescription>
            No products match your search criteria. Try adjusting your search term.
          </AlertDescription>
        </Alert>
      )}

      {/* Product grid */}
      {hasProducts && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="truncate">{product.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <EditProductDialog product={product} />
                    <DeleteProductDialog productId={product.id} productName={product.name} />
                  </div>
                </div>
                <CardDescription>Version {product.version}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {product.description || 'No description provided'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
