
import React from 'react';
import { ProductList } from '@/components/products/ProductList';
// Removed unused imports Link and Button, Map icon
// import { Link } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Map } from 'lucide-react';

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
        {/* Removed the "View Roadmap" button here */}
      </div>
      <ProductList />
    </div>
  );
}
