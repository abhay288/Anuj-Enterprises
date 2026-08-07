import React from 'react';
import { FlipkartCategoryBar } from './FlipkartCategoryBar';
import { FlipkartBanner } from './FlipkartBanner';
import { ProductGrid } from '../catalogue/ProductGrid';

export const HomeDashboard = () => {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Flipkart Top Category Navigation Bar */}
      <FlipkartCategoryBar />

      {/* Flipkart Compact Deal Banner */}
      <FlipkartBanner />

      {/* Direct Product Catalogue Dashboard */}
      <ProductGrid />
    </div>
  );
};
