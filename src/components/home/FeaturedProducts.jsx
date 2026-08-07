import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Flame, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from '../catalogue/ProductCard';

export const FeaturedProducts = () => {
  const { products, navigateTo } = useApp();
  const [activeTab, setActiveTab] = useState('featured'); // 'featured' | 'trending' | 'bulk'

  const filteredProducts = products.filter(p => {
    if (activeTab === 'trending') return p.isTrending;
    if (activeTab === 'bulk') return p.bulkTiers && p.bulkTiers.length > 0;
    return p.isFeatured;
  });

  return (
    <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 block mb-1">
              Industrial Grade Verified Inventory
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Featured Supply Catalog
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl self-start md:self-auto border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'featured'
                  ? 'bg-brand-900 text-white shadow-md dark:bg-brand-600'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" /> Featured Supplies
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'trending'
                  ? 'bg-brand-900 text-white shadow-md dark:bg-brand-600'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" /> High Demand
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'bulk'
                  ? 'bg-brand-900 text-white shadow-md dark:bg-brand-600'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Tiered Bulk Deals
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.slice(0, 8).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Catalogue CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigateTo('catalogue')}
            className="px-8 py-4 bg-slate-900 hover:bg-brand-900 text-white dark:bg-slate-800 dark:hover:bg-brand-600 font-extrabold text-sm rounded-2xl shadow-xl transition-all hover:scale-105 inline-flex items-center gap-2"
          >
            <span>Explore Complete B2B Catalog ({products.length} Items)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
