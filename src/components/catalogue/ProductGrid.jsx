import React, { useState, useMemo, useEffect } from 'react';
import { PackageX, LayoutGrid, List, Search, X, SlidersHorizontal, Sparkles, CheckCircle2, WifiOff } from 'lucide-react';
import { useApp, normalizeBrandName } from '../../context/AppContext';
import { ProductCard } from './ProductCard';
import { FilterSidebar } from './FilterSidebar';
import { FilterBottomSheet } from './FilterBottomSheet';
import { updatePageSEO } from '../../utils/seoUtils';
import { getPackagingLevels } from '../../utils/packagingUtils';

export const ProductCardSkeleton = () => (
  <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm animate-pulse space-y-4">
    <div className="h-44 bg-slate-100 dark:bg-slate-800 rounded-xl" />
    <div className="space-y-2">
      <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800 rounded" />
    </div>
    <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-xl" />
  </div>
);

const ProductListItem = ({ product }) => {
  const { addToCart, navigateTo, t } = useApp();
  const [quantity, setQuantity] = useState(1);

  const handleQtyInput = (e) => {
    const val = parseInt(e.target.value, 10);
    setQuantity(isNaN(val) || val <= 0 ? '' : val);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-lg transition-all flex flex-col sm:flex-row items-center justify-between gap-6">
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        decoding="async"
        className="w-32 h-32 object-contain bg-slate-50 dark:bg-slate-950 p-2 rounded-xl cursor-pointer hover:scale-105 transition-transform"
        onClick={() => navigateTo('product-detail', product.id)}
      />

      <div className="flex-1 space-y-1.5 w-full sm:w-auto">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-md bg-brand-950 text-white">
            {product.brand}
          </span>
          <span className="text-xs text-slate-400 font-mono">SKU: {product.sku}</span>
          <span className="text-xs text-slate-400 font-mono">HSN: {product.hsn || '19053100'}</span>
          {product.isNew && (
            <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-amber-400 text-slate-950">
              {t('new_arrival', 'NEW ARRIVAL')}
            </span>
          )}
          {product.isFeatured && (
            <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-emerald-500 text-white">
              FEATURED
            </span>
          )}
        </div>
        <h3 
          onClick={() => navigateTo('product-detail', product.id)}
          className="text-base font-bold text-slate-900 dark:text-white hover:text-brand-900 dark:hover:text-brand-400 cursor-pointer"
        >
          {product.name}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
          {product.description}
        </p>
        
        {/* Packaging & Unit Info Pills (Only shown if configured by Admin) */}
        {getPackagingLevels(product).length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-600 dark:text-slate-300">
            {getPackagingLevels(product).map((lvl) => (
              <span 
                key={lvl.key}
                className={`px-2 py-0.5 rounded font-medium ${
                  lvl.key === 'case' || lvl.key === 'bori'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                {t(lvl.label, lvl.label)}: <strong>{lvl.value}</strong>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="text-right sm:border-l sm:border-slate-100 sm:dark:border-slate-800 sm:pl-6 space-y-3 shrink-0 w-full sm:w-auto">
        <div className="flex items-center justify-between sm:justify-end gap-2 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 pr-1">Qty:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, (parseInt(quantity) || 1) - 1))}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 font-bold hover:bg-slate-200 text-sm shadow-sm"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={handleQtyInput}
              onBlur={() => (!quantity || quantity < 1) && setQuantity(1)}
              className="w-14 h-7 text-center text-xs font-extrabold bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="button"
              onClick={() => setQuantity((parseInt(quantity) || 0) + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 font-bold hover:bg-slate-200 text-sm shadow-sm"
            >
              +
            </button>
          </div>
        </div>
        <button
          onClick={() => addToCart(product, parseInt(quantity) || 1)}
          className="w-full px-4 py-2 bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs rounded-xl transition-colors shadow"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export const ProductGrid = () => {
  const { 
    products, 
    brands,
    searchQuery, 
    setSearchQuery, 
    selectedCategoryFilter, 
    setSelectedCategoryFilter,
    isMobileFilterOpen,
    setIsMobileFilterOpen,
    navigateTo,
    t
  } = useApp();

  const [selectedCategories, setSelectedCategories] = useState(
    selectedCategoryFilter && selectedCategoryFilter !== 'All' ? [selectedCategoryFilter] : ['All']
  );
  const [selectedBrands, setSelectedBrands] = useState(['All']);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [newOnly, setNewOnly] = useState(false);
  const [bulkOnly, setBulkOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'rating' | 'new' | 'price-low' | 'price-high'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Update SEO for Catalogue View
  useEffect(() => {
    updatePageSEO({
      title: 'B2B Product Catalogue & FMCG Wholesale Sourcing Directory',
      description: 'Explore verified FMCG wholesale catalog at Anuj Enterprises Kanpur. Direct manufacturer supplies for Amul, Nestlé, Britannia, Cadbury, Colgate, Fortune, and HUL with official B2B invoices.',
      url: 'https://anujfmcg.com/#/catalogue',
      breadcrumbs: [
        { name: 'Home', url: 'https://anujfmcg.com/' },
        { name: 'Products Catalogue', url: 'https://anujfmcg.com/#/catalogue' }
      ]
    });
  }, []);

  useEffect(() => {
    if (selectedCategoryFilter) {
      if (selectedCategoryFilter === 'All') {
        setSelectedCategories(['All']);
      } else {
        setSelectedCategories([selectedCategoryFilter]);
      }
    }
  }, [selectedCategoryFilter]);

  const resetFilters = () => {
    setSelectedCategories(['All']);
    setSelectedCategoryFilter('All');
    setSelectedBrands(['All']);
    setFeaturedOnly(false);
    setNewOnly(false);
    setBulkOnly(false);
    setSearchQuery('');
    setSortBy('featured');
  };

  // Build brand rank priority lookup map with robust diacritic normalization
  const brandRankMap = useMemo(() => {
    const map = {};
    (brands || []).forEach((b, index) => {
      const name = typeof b === 'string' ? b : b.name;
      const rank = (typeof b === 'object' && typeof b.rank === 'number' && b.rank > 0) ? b.rank : (index + 1);
      if (name) {
        map[normalizeBrandName(name)] = rank;
      }
    });
    return map;
  }, [brands]);

  // Smart Search & Multi-criteria Filtering Algorithm
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes('All')) {
        if (!selectedCategories.includes(p.category)) return false;
      }
      // Company / Brand filter
      if (selectedBrands.length > 0 && !selectedBrands.includes('All')) {
        const selectedNorms = selectedBrands.map(normalizeBrandName);
        if (!selectedNorms.includes(normalizeBrandName(p.brand))) return false;
      }
      // Featured check
      if (featuredOnly && !p.isFeatured) return false;
      // New Arrival check
      if (newOnly && !p.isNew) return false;
      // Bulk / Case tier discount availability check
      if (bulkOnly && (!p.bulkTiers || p.bulkTiers.length === 0)) return false;

      // Smart Search token matching
      if (searchQuery.trim()) {
        const queryTokens = searchQuery.toLowerCase().trim().split(/\s+/);
        const searchableText = `${p.name} ${p.brand} ${p.sku} ${p.hsn || ''} ${p.category} ${p.description || ''}`.toLowerCase();
        
        // Every token must match somewhere in the product metadata (Smart multi-token search)
        const allTokensMatch = queryTokens.every(token => searchableText.includes(token));
        if (!allTokensMatch) return false;
      }
      return true;
    }).sort((a, b) => {
      // If user is searching, prioritize exact SKU or title prefix matches
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const aSkuMatch = a.sku?.toLowerCase() === q ? 10 : a.sku?.toLowerCase().includes(q) ? 5 : 0;
        const bSkuMatch = b.sku?.toLowerCase() === q ? 10 : b.sku?.toLowerCase().includes(q) ? 5 : 0;
        if (aSkuMatch !== bSkuMatch) return bSkuMatch - aSkuMatch;

        const aNamePrefix = a.name?.toLowerCase().startsWith(q) ? 4 : 0;
        const bNamePrefix = b.name?.toLowerCase().startsWith(q) ? 4 : 0;
        if (aNamePrefix !== bNamePrefix) return bNamePrefix - aNamePrefix;
      }

      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'new') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);

      // Default & Featured Sort: Prioritize products from higher-ranked brands / companies
      const aBrandRank = brandRankMap[normalizeBrandName(a.brand)] ?? 999;
      const bBrandRank = brandRankMap[normalizeBrandName(b.brand)] ?? 999;
      if (aBrandRank !== bBrandRank) {
        return aBrandRank - bBrandRank;
      }

      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, selectedCategories, selectedBrands, featuredOnly, newOnly, bulkOnly, searchQuery, sortBy, brandRankMap]);

  return (
    <div className="py-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumb & Control Bar */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="cursor-pointer hover:underline" onClick={() => navigateTo('home')}>{t('nav_home', 'Home')}</span>
              <span>/</span>
              <span className="font-bold text-slate-900 dark:text-white">{t('nav_products', 'Product Catalogue')}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('b2b_catalogue_title', 'B2B Enterprise Catalogue & Sourcing')}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {t('displaying', 'Displaying')} {filteredProducts.length} {t('verified_products', 'verified products with direct manufacturer supply & official invoices.')}
            </p>
          </div>

          {/* Controls Bar: Sort, Search, View Mode */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm cursor-pointer"
                title="Sort Catalogue Products"
              >
                <option value="featured">👑 Priority (Company Ranking)</option>
                <option value="new">✨ Newest Arrivals</option>
                <option value="rating">⭐ Highest Rated</option>
                <option value="price-low">💰 Price: Low to High</option>
                <option value="price-high">💎 Price: High to Low</option>
              </select>
            </div>

            {/* Search Input Box */}
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_placeholder', 'Search name, SKU, brand...')}
                className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-900 text-slate-900 dark:text-white shadow-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Grid / List View Toggle */}
            <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-brand-900 text-white' : 'text-slate-400 hover:text-slate-700'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-brand-900 text-white' : 'text-slate-400 hover:text-slate-700'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Sidebar Component */}
        <FilterSidebar
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedBrands={selectedBrands}
          setSelectedBrands={setSelectedBrands}
          featuredOnly={featuredOnly}
          setFeaturedOnly={setFeaturedOnly}
          newOnly={newOnly}
          setNewOnly={setNewOnly}
          bulkOnly={bulkOnly}
          setBulkOnly={setBulkOnly}
          onReset={resetFilters}
        />

        {/* Products Container */}
        <div>
          {filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center my-8 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-slate-800 text-amber-500 mx-auto flex items-center justify-center mb-4">
                <PackageX className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                No Products Matched Your Sourcing Criteria
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                Try clearing selected search keywords or category filters to display all catalog items.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs rounded-xl shadow transition-all"
              >
                Clear All Filters & Reset Search
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map(product => (
                <ProductListItem key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Mobile Bottom-Sheet Filter Modal */}
      <FilterBottomSheet
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        selectedBrands={selectedBrands}
        setSelectedBrands={setSelectedBrands}
        featuredOnly={featuredOnly}
        setFeaturedOnly={setFeaturedOnly}
        newOnly={newOnly}
        setNewOnly={setNewOnly}
        bulkOnly={bulkOnly}
        setBulkOnly={setBulkOnly}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onReset={resetFilters}
      />
    </div>
  );
};
