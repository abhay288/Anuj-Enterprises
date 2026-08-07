import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, List, Search, ArrowUpDown, X, PackageX, Sparkles, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from './ProductCard';
import { FilterSidebar } from './FilterSidebar';

export const ProductGrid = () => {
  const { 
    products, 
    searchQuery, 
    setSearchQuery, 
    selectedCategoryFilter, 
    setSelectedCategoryFilter 
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState(selectedCategoryFilter || 'All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [priceRange, setPriceRange] = useState(60000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'price-low' | 'price-high' | 'rating'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [isLoading, setIsLoading] = useState(false);

  // Sync state if category filter changed globally
  React.useEffect(() => {
    if (selectedCategoryFilter) {
      setSelectedCategory(selectedCategoryFilter);
    }
  }, [selectedCategoryFilter]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedCategoryFilter('All');
    setSelectedBrand('All');
    setPriceRange(60000);
    setInStockOnly(false);
    setSearchQuery('');
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category check
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      // Brand check
      if (selectedBrand !== 'All' && p.brand !== selectedBrand) return false;
      // Price check
      if (p.price > priceRange) return false;
      // In stock check
      if (inStockOnly && p.stock <= 0) return false;
      // Search query check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesBrand = p.brand.toLowerCase().includes(query);
        const matchesSku = p.sku.toLowerCase().includes(query);
        const matchesHsn = p.hsn && p.hsn.includes(query);
        const matchesCategory = p.category.toLowerCase().includes(query);
        if (!matchesName && !matchesBrand && !matchesSku && !matchesHsn && !matchesCategory) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // default featured
    });
  }, [products, selectedCategory, selectedBrand, priceRange, inStockOnly, searchQuery, sortBy]);

  return (
    <div className="py-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumb & Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Home</span>
            <span>/</span>
            <span className="font-bold text-slate-900 dark:text-white">Product Catalogue</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            FMCG Wholesale & Consumer Goods Supply
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Displaying {filteredProducts.length} verified B2B FMCG products with direct brand sourcing & GST tax invoices.
          </p>
        </div>

        {/* Top Control Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Quick Active Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Active:</span>
            {selectedCategory !== 'All' && (
              <span className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-900 dark:bg-slate-800 dark:text-brand-400 text-xs font-bold flex items-center gap-1">
                Cat: {selectedCategory}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('All')} />
              </span>
            )}
            {selectedBrand !== 'All' && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 dark:bg-slate-800 dark:text-amber-400 text-xs font-bold flex items-center gap-1">
                Brand: {selectedBrand}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedBrand('All')} />
              </span>
            )}
            {searchQuery && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 dark:bg-slate-800 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                Query: "{searchQuery}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
              </span>
            )}
            {(selectedCategory === 'All' && selectedBrand === 'All' && !searchQuery) && (
              <span className="text-xs text-slate-500 italic">Showing full catalog</span>
            )}
          </div>

          {/* Controls: Sort & Grid View Toggle */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            {/* Sort Selection */}
            <div className="relative flex items-center">
              <ArrowUpDown className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-8 pr-8 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="featured">Sort: Featured First</option>
                <option value="price-low">Sort: Price (Low to High)</option>
                <option value="price-high">Sort: Price (High to Low)</option>
                <option value="rating">Sort: Top Rated</option>
              </select>
            </div>

            {/* Grid / List View Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-brand-900 dark:text-brand-400 shadow' : 'text-slate-400'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white dark:bg-slate-900 text-brand-900 dark:text-brand-400 shadow' : 'text-slate-400'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Main Section: Sidebar + Product Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <FilterSidebar
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            inStockOnly={inStockOnly}
            setInStockOnly={setInStockOnly}
            resetFilters={resetFilters}
          />

          {/* Products Container */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center my-8 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-slate-800 text-amber-500 mx-auto flex items-center justify-center mb-4">
                  <PackageX className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  No Industrial Products Matched Your Criteria
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                  Try adjusting your search terms, expanding the price range slider, or clearing category filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-brand-900 hover:bg-brand-800 text-white dark:bg-brand-600 font-bold text-xs rounded-xl shadow transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              /* List View Layout */
              <div className="space-y-4">
                {filteredProducts.map(product => (
                  <div 
                    key={product.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-lg transition-all flex flex-col sm:flex-row items-center justify-between gap-6"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-32 h-32 object-contain bg-slate-50 dark:bg-slate-950 p-2 rounded-xl"
                    />

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-brand-950 text-white">
                          {product.brand}
                        </span>
                        <span className="text-xs text-slate-400">SKU: {product.sku}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {product.description}
                      </p>
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                        Available Stock: {product.stock} units
                      </span>
                    </div>

                    <div className="text-right sm:border-l sm:border-slate-100 sm:dark:border-slate-800 sm:pl-6 space-y-2 shrink-0">
                      <div>
                        <span className="text-xl font-extrabold text-brand-900 dark:text-brand-400 block">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 block">+ {product.gstRate}% GST</span>
                      </div>
                      <button
                        onClick={() => useApp().addToCart(product, 1)}
                        className="px-4 py-2 bg-brand-900 text-white font-bold text-xs rounded-xl hover:bg-brand-800 transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
