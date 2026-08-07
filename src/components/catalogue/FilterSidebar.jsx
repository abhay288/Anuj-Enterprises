import React from 'react';
import { Filter, RotateCcw, Check, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FilterSidebar = ({
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  priceRange,
  setPriceRange,
  inStockOnly,
  setInStockOnly,
  resetFilters
}) => {
  const { categories, brands } = useApp();

  return (
    <aside className="w-full lg:w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-6 shadow-sm h-fit">
      
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
          <Filter className="w-4 h-4 text-amber-500" />
          <span>Catalog Filters</span>
        </div>
        <button
          onClick={resetFilters}
          className="text-xs text-brand-900 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Department / Category
        </h4>
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex justify-between items-center transition-colors ${
              selectedCategory === 'All'
                ? 'bg-brand-900 text-white dark:bg-brand-600'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex justify-between items-center transition-colors ${
                selectedCategory === cat.name
                  ? 'bg-brand-900 text-white dark:bg-brand-600'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="truncate">{cat.name}</span>
              <span className="text-[10px] opacity-75">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          OEM Brand Partner
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedBrand('All')}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedBrand === 'All'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Brands
          </button>
          {brands.map((brand) => (
            <label
              key={brand.id}
              className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer"
            >
              <input
                type="radio"
                name="brandFilter"
                checked={selectedBrand === brand.name}
                onChange={() => setSelectedBrand(brand.name)}
                className="text-amber-500 focus:ring-amber-500"
              />
              <span className="truncate">{brand.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Slider Filter */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Price Range
          </h4>
          <span className="text-xs font-bold text-brand-900 dark:text-brand-400">
            Up to ₹{priceRange.toLocaleString('en-IN')}
          </span>
        </div>
        <input
          type="range"
          min="100"
          max="60000"
          step="500"
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>₹100</span>
          <span>₹60,000+</span>
        </div>
      </div>

      {/* Availability Toggle */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <label className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
          <span>Show In-Stock Only</span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 rounded text-brand-900 focus:ring-brand-500"
          />
        </label>
      </div>

    </aside>
  );
};
