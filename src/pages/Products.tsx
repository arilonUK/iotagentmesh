
import React from 'react';
import { Link } from 'react-router-dom';
import { ProductList } from '@/components/products/ProductList';
import { Button } from '@/components/ui/button';
import { Map } from 'lucide-react';

export default function Products() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-2">
            Manage and monitor your IoT product templates
          </p>
        </div>
        <Link to="/dashboard/products/roadmap">
          <Button variant="outline" className="gap-2">
            <Map className="h-4 w-4" />
            View Roadmap
          </Button>
        </Link>
      </div>
      <ProductList />
    </div>
  );
}
