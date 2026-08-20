import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, RotateCcw, Check, Sparkles, Building2, Package, CheckCircle2, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FilterBottomSheet = ({
  isOpen,
  onClose,
  selectedCategories = ['All'],
  setSelectedCategories,
  selectedBrands = ['All'],
  setSelectedBrands,
  stockOnly,
  setStockOnly,
  featuredOnly,
  setFeaturedOnly,
  newOnly,
  setNewOnly,
  bulkOnly,
  setBulkOnly,
  sortBy,
  setSortBy,
  onReset
}) => {
  const { categories, brands } = useApp();

  if (!isOpen) return null;

  const toggleBrand = (brandName) => {
    if (brandName === 'All') {
      setSelectedBrands(['All']);
      return;
    }
    let updated;
    if (selectedBrands.includes('All')) {
      updated = [brandName];
    } else if (selectedBrands.includes(brandName)) {
      updated = selectedBrands.filter(b => b !== brandName);
      if (updated.length === 0) updated = ['All'];
    } else {
      updated = [...selectedBrands.filter(b => b !== 'All'), brandName];
    }
    setSelectedBrands(updated);
  };

  const toggleCategory = (catName) => {
    if (catName === 'All') {
      setSelectedCategories(['All']);
      return;
    }
    let updated;
    if (selectedCategories.includes('All')) {
      updated = [catName];
    } else if (selectedCategories.includes(catName)) {
      updated = selectedCategories.filter(c => c !== catName);
      if (updated.length === 0) updated = ['All'];
    } else {
      updated = [...selectedCategories.filter(c => c !== 'All'), catName];
    }
    setSelectedCategories(updated);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/80 backdrop-blur-sm lg:hidden">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-h-[88vh] bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header handle & Title */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-900 text-amber-400 flex items-center justify-center font-bold">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Mobile Sourcing Filters
                </h3>
                <span className="text-[10px] text-slate-400">Filter by company, category & bulk volume terms</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Filter Content */}
          <div className="p-5 space-y-6 overflow-y-auto flex-1 text-xs">
            
            {/* Sort Filter */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                Sort Products By
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'featured', label: 'Featured First' },
                  { id: 'rating', label: 'Top Rated (4.8+)' },
                  { id: 'new', label: 'New Arrivals' },
                  { id: 'price-low', label: 'Price: Low to High' },
                  { id: 'price-high', label: 'Price: High to Low' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSortBy(s.id)}
                    className={`p-2.5 rounded-xl font-bold text-xs border text-left flex items-center justify-between transition-colors ${
                      sortBy === s.id
                        ? 'bg-brand-900 text-white border-brand-900 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>{s.label}</span>
                    {sortBy === s.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Sourcing Toggles */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                Stock & Availability Flags
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStockOnly(!stockOnly)}
                  className={`p-2.5 rounded-xl font-bold text-xs border text-left flex items-center justify-between transition-colors ${
                    stockOnly
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>In Stock Only</span>
                  {stockOnly && <Check className="w-3.5 h-3.5 text-white" />}
                </button>

                <button
                  type="button"
                  onClick={() => setNewOnly(!newOnly)}
                  className={`p-2.5 rounded-xl font-bold text-xs border text-left flex items-center justify-between transition-colors ${
                    newOnly
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> New Arrivals</span>
                  {newOnly && <Check className="w-3.5 h-3.5 text-slate-950" />}
                </button>

                <button
                  type="button"
                  onClick={() => setFeaturedOnly(!featuredOnly)}
                  className={`p-2.5 rounded-xl font-bold text-xs border text-left flex items-center justify-between transition-colors ${
                    featuredOnly
                      ? 'bg-brand-900 text-white border-brand-900 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>Featured Products</span>
                  {featuredOnly && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setBulkOnly(!bulkOnly)}
                  className={`p-2.5 rounded-xl font-bold text-xs border text-left flex items-center justify-between transition-colors ${
                    bulkOnly
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> Case Discounts</span>
                  {bulkOnly && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              </div>
            </div>

            {/* Company / Brand Filter */}
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-amber-500" />
                Select Authorized Companies / Brands
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleBrand('All')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    selectedBrands.includes('All')
                      ? 'bg-brand-900 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  All Brands ({brands.length})
                </button>
                {brands.map(b => {
                  const bName = typeof b === 'string' ? b : b.name;
                  const isSelected = !selectedBrands.includes('All') && selectedBrands.includes(bName);
                  return (
                    <button
                      key={bName}
                      type="button"
                      onClick={() => toggleBrand(bName)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 ${
                        isSelected
                          ? 'bg-brand-900 text-white font-bold shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{bName}</span>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-amber-500" />
                Select Product Categories
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleCategory('All')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    selectedCategories.includes('All')
                      ? 'bg-brand-900 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  All Categories
                </button>
                {categories.map(c => {
                  const cName = typeof c === 'string' ? c : c.name;
                  const isSelected = !selectedCategories.includes('All') && selectedCategories.includes(cName);
                  return (
                    <button
                      key={cName}
                      type="button"
                      onClick={() => toggleCategory(cName)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 ${
                        isSelected
                          ? 'bg-brand-900 text-white font-bold shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{cName}</span>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Footer Controls */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-3">
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-brand-900 hover:bg-brand-800 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              Apply Filter Selection
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
