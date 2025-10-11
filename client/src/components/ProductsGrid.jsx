// client/src/components/ProductsGrid.jsx
import React from 'react';
import ProductCard from './ProductCard';

const ProductsGrid = ({ products = [], className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6' }) => (
  <div className={className}>
    {products.map((p) => (
      <ProductCard key={p.sku} product={p} />
    ))}
  </div>
);

export default ProductsGrid;
