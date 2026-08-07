import React from 'react';
import { RotateCcw, Filter, Tag, Check, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FilterSidebar = ({
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  inStockOnly,
  setInStockOnly,
  onReset
}) => {
  const { categories, brands } = useApp();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-6 shadow-sm">
      
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-900 dark:text-brand-400" />
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Catalog Filters
          </h2>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-slate-500 hover:text-brand-900 dark:hover:text-amber-400 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Category Picker */}
      <div className="space-y-3">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
          Department / Category
        </span>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
              selectedCategory === 'All'
                ? 'bg-brand-900 text-white font-bold shadow'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>All Categories</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                selectedCategory === cat.name
                  ? 'bg-brand-900 text-white font-bold shadow'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-[10px] opacity-80">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brand Radio Options */}
      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
          Brand / Manufacturer
        </span>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedBrand('All')}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
              selectedBrand === 'All' ? 'text-brand-900 dark:text-amber-400 font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedBrand === 'All' ? 'border-brand-900 bg-brand-900 text-white' : 'border-slate-300'}`}>
              {selectedBrand === 'All' && <Check className="w-2.5 h-2.5" />}
            </div>
            <span>All Brands</span>
          </button>

          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBrand(b.name)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
                selectedBrand === b.name ? 'text-brand-900 dark:text-amber-400 font-bold' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedBrand === b.name ? 'border-brand-900 bg-brand-900 text-white' : 'border-slate-300'}`}>
                {selectedBrand === b.name && <Check className="w-2.5 h-2.5" />}
              </div>
              <span>{b.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* In-Stock Toggle */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Show In-Stock Only
          </span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-brand-900 focus:ring-brand-500"
          />
        </label>
      </div>
    </div>
  );
};
