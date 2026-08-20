import React from 'react';
import { ProductGrid } from '../catalogue/ProductGrid';

export const HomeDashboard = () => {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Main Product Catalogue Grid */}
      <ProductGrid />
    </div>
  );
};
