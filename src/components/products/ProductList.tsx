
import React from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function ProductList() {
  const { products, isLoading, error } = useProducts();

  if (isLoading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return <div>Error loading products</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Product
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products?.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>Version {product.version}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {product.description || 'No description provided'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
