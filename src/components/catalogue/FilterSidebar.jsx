import React, { useMemo } from 'react';
import { RotateCcw, Filter, Building2, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FilterSidebar = ({
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  onReset
}) => {
  const { categories, brands, products } = useApp();

  // Dynamic category options based on selected Company (1st Filter)
  const availableCategories = useMemo(() => {
    if (selectedBrand === 'All') {
      return categories.map(c => c.name);
    }
    const companyCategories = new Set(
      products
        .filter(p => p.brand === selectedBrand)
        .map(p => p.category)
    );
    return Array.from(companyCategories);
  }, [selectedBrand, categories, products]);

  // Handle Company Selection
  const handleCompanyChange = (e) => {
    const newBrand = e.target.value;
    setSelectedBrand(newBrand);
    if (newBrand !== 'All') {
      const companyCats = new Set(
        products.filter(p => p.brand === newBrand).map(p => p.category)
      );
      if (selectedCategory !== 'All' && !companyCats.has(selectedCategory)) {
        setSelectedCategory('All');
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      
      {/* Title & Filter Dropdowns Container */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
        <div className="flex items-center gap-2 pr-4 border-r-0 sm:border-r border-slate-200 dark:border-slate-800 shrink-0">
          <Filter className="w-4 h-4 text-brand-900 dark:text-brand-400" />
          <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Catalog Filters
          </h2>
        </div>

        {/* 1st Filter: Company */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Building2 className="w-4 h-4 text-amber-500 shrink-0" />
          <div className="flex flex-col w-full">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-0.5">
              Company
            </label>
            <select
              value={selectedBrand}
              onChange={handleCompanyChange}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value="All">All Companies ({brands.length})</option>
              {brands.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2nd Filter: Category (Filtered by Company Selection) */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Layers className="w-4 h-4 text-emerald-500 shrink-0" />
          <div className="flex flex-col w-full">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-0.5">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value="All">All Categories</option>
              {availableCategories.map((catName) => (
                <option key={catName} value={catName}>
                  {catName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reset Action Button */}
      <button
        onClick={onReset}
        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
      >
        <RotateCcw className="w-3.5 h-3.5" /> Reset
      </button>

    </div>
  );
};
