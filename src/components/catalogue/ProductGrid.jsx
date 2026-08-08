// Helper component for list view items with quantity selector
const ProductListItem = ({ product }) => {
  const { addToCart, navigateTo } = useApp();
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-lg transition-all flex flex-col sm:flex-row items-center justify-between gap-6">
      <img
        src={product.image}
        alt={product.name}
        className="w-32 h-32 object-contain bg-slate-50 dark:bg-slate-950 p-2 rounded-xl cursor-pointer"
        onClick={() => navigateTo('product-detail', product.id)}
      />

      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-brand-950 text-white">
            {product.brand}
          </span>
          <span className="text-xs text-slate-400">SKU: {product.sku}</span>
        </div>
        <h3 
          onClick={() => navigateTo('product-detail', product.id)}
          className="text-base font-bold text-slate-900 dark:text-white hover:text-brand-900 cursor-pointer"
        >
          {product.name}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2">
          {product.description}
        </p>
        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
          Available Stock: {product.stock} units
        </span>
      </div>

      <div className="text-right sm:border-l sm:border-slate-100 sm:dark:border-slate-800 sm:pl-6 space-y-3 shrink-0">
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 pr-1">Qty:</span>
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-sm text-sm"
          >
            -
          </button>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-12 h-7 text-center text-xs font-extrabold bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-sm text-sm"
          >
            +
          </button>
        </div>
        <button
          onClick={() => addToCart(product, quantity)}
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
    searchQuery, 
    setSearchQuery, 
    selectedCategoryFilter, 
    setSelectedCategoryFilter 
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState(selectedCategoryFilter || 'All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [priceRange, setPriceRange] = useState(60000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'rating'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

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
    setSearchQuery('');
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category check
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      // Brand / Company check
      if (selectedBrand !== 'All' && p.brand !== selectedBrand) return false;
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
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // default featured
    });
  }, [products, selectedCategory, selectedBrand, searchQuery, sortBy]);

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

        {/* Horizontal Catalog Filter Bar above products */}
        <FilterSidebar
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          onReset={resetFilters}
        />

        {/* Products Container */}
        <div>
          {filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center my-8 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-slate-800 text-amber-500 mx-auto flex items-center justify-center mb-4">
                <PackageX className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                No Industrial Products Matched Your Criteria
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                Try adjusting your search terms or clearing company and category filters.
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
                <ProductListItem key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
