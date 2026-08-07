import React from 'react';
import { 
  ShoppingBag, Coffee, Smile, Package, Sparkles, Gift, Grid 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FlipkartCategoryBar = () => {
  const { categories, selectedCategoryFilter, filterByCategory } = useApp();

  const getCategoryIcon = (name) => {
    if (name.includes('Personal')) return <Smile className="w-5 h-5 text-amber-500" />;
    if (name.includes('Dairy')) return <Package className="w-5 h-5 text-emerald-500" />;
    if (name.includes('Tea') || name.includes('Coffee')) return <Coffee className="w-5 h-5 text-purple-500" />;
    if (name.includes('Cleaning') || name.includes('Home')) return <Sparkles className="w-5 h-5 text-blue-500" />;
    if (name.includes('Snacks') || name.includes('Confectionery')) return <Gift className="w-5 h-5 text-red-500" />;
    return <ShoppingBag className="w-5 h-5 text-brand-500" />;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm py-3 px-4 overflow-x-auto">
      <div className="max-w-7xl mx-auto flex items-center justify-start md:justify-center gap-4 sm:gap-8 min-w-max">
        
        {/* All Category Pill */}
        <button
          onClick={() => filterByCategory('All')}
          className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ${
            selectedCategoryFilter === 'All'
              ? 'bg-brand-50 dark:bg-slate-800 text-brand-900 dark:text-amber-400 scale-105 font-bold'
              : 'text-slate-700 dark:text-slate-300 hover:text-brand-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-sm">
            <Grid className="w-5 h-5 text-brand-900 dark:text-brand-400" />
          </div>
          <span className="text-xs font-semibold">All Items</span>
        </button>

        {/* Categories */}
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => filterByCategory(cat.name)}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ${
              selectedCategoryFilter === cat.name
                ? 'bg-brand-50 dark:bg-slate-800 text-brand-900 dark:text-amber-400 scale-105 font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:text-brand-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-sm">
              {getCategoryIcon(cat.name)}
            </div>
            <span className="text-xs font-semibold">{cat.name}</span>
          </button>
        ))}

      </div>
    </div>
  );
};
