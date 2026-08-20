import React, { useState, useRef, useEffect, useMemo } from 'react';
import { RotateCcw, Filter, Building2, Package, ChevronDown, Check, Sparkles, SlidersHorizontal, Layers, Box, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const MultiSelectDropdown = ({ 
  label, 
  icon: Icon, 
  allLabel, 
  options, 
  selectedValues = ['All'], 
  onChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAllSelected = !selectedValues || selectedValues.length === 0 || selectedValues.includes('All');

  const toggleOption = (val) => {
    if (val === 'All') {
      onChange(['All']);
      return;
    }

    let updated;
    if (selectedValues.includes('All')) {
      updated = [val];
    } else if (selectedValues.includes(val)) {
      updated = selectedValues.filter(v => v !== val);
      if (updated.length === 0) updated = ['All'];
    } else {
      updated = [...selectedValues.filter(v => v !== 'All'), val];
    }
    onChange(updated);
  };

  const getDisplayText = () => {
    if (isAllSelected) return allLabel;
    if (selectedValues.length === 1) return selectedValues[0];
    return `${selectedValues.length} Selected (${selectedValues.slice(0, 2).join(', ')}${selectedValues.length > 2 ? '...' : ''})`;
  };

  return (
    <div className="relative flex-1 min-w-[200px]" ref={dropdownRef}>
      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
        <Icon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between shadow-sm hover:border-brand-500 transition-colors"
      >
        <span className="truncate pr-2">{getDisplayText()}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-30 p-2 max-h-64 overflow-y-auto space-y-1">
          <button
            type="button"
            onClick={() => toggleOption('All')}
            className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
              isAllSelected
                ? 'bg-brand-50 text-brand-900 dark:bg-slate-800 dark:text-amber-400 font-extrabold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{allLabel}</span>
            {isAllSelected && <Check className="w-3.5 h-3.5 text-brand-900 dark:text-amber-400" />}
          </button>

          <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

          {options.map((opt) => {
            const optName = typeof opt === 'string' ? opt : opt.name;
            const isSelected = !isAllSelected && selectedValues.includes(optName);
            return (
              <button
                key={optName}
                type="button"
                onClick={() => toggleOption(optName)}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-brand-900 text-white font-bold shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="truncate pr-2">{optName}</span>
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                  isSelected ? 'border-white bg-white/20' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const FilterSidebar = ({
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
  onReset
}) => {
  const { categories, brands, products, setIsMobileFilterOpen } = useApp();

  const availableCategories = useMemo(() => {
    if (!selectedBrands || selectedBrands.length === 0 || selectedBrands.includes('All')) {
      return categories.map(c => c.name);
    }
    const companyCategories = new Set(
      products
        .filter(p => selectedBrands.includes(p.brand))
        .map(p => p.category)
    );
    return Array.from(companyCategories);
  }, [selectedBrands, categories, products]);

  // Active filter count logic
  const activeCount = 
    (selectedBrands.includes('All') ? 0 : selectedBrands.length) +
    (selectedCategories.includes('All') ? 0 : selectedCategories.length) +
    (stockOnly ? 1 : 0) +
    (featuredOnly ? 1 : 0) +
    (newOnly ? 1 : 0) +
    (bulkOnly ? 1 : 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-6 shadow-sm">
      
      {/* Mobile Filter Trigger Button */}
      <div className="lg:hidden flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(true)}
          className="w-full py-2.5 px-4 bg-brand-900 hover:bg-brand-800 text-white font-extrabold text-xs rounded-xl shadow flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <span>Open Mobile Filters & Sourcing Criteria</span>
          </div>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
              {activeCount} Active
            </span>
          )}
        </button>
      </div>

      {/* Desktop Filter Bar Layout */}
      <div className="hidden lg:flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <div className="flex items-center gap-2 pr-4 border-r border-slate-200 dark:border-slate-800 shrink-0">
            <Filter className="w-4 h-4 text-brand-900 dark:text-brand-400" />
            <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Filters {activeCount > 0 && <span className="text-amber-500 font-bold">({activeCount})</span>}
            </h2>
          </div>

          {/* 1st Filter: Company / Brand */}
          <MultiSelectDropdown
            label="Company / Brand"
            icon={Building2}
            allLabel={`All Companies (${brands.length})`}
            options={brands}
            selectedValues={selectedBrands}
            onChange={setSelectedBrands}
          />

          {/* 2nd Filter: Category */}
          <MultiSelectDropdown
            label="Category Segment"
            icon={Package}
            allLabel="All Categories"
            options={availableCategories}
            selectedValues={selectedCategories}
            onChange={setSelectedCategories}
          />

          {/* Quick Filter Pill Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 xl:pt-0">
            <button
              type="button"
              onClick={() => setStockOnly(!stockOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                stockOnly
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              In Stock
            </button>

            <button
              type="button"
              onClick={() => setNewOnly(!newOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1 ${
                newOnly
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3 h-3" /> New Arrivals
            </button>

            <button
              type="button"
              onClick={() => setFeaturedOnly(!featuredOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                featuredOnly
                  ? 'bg-brand-900 text-white border-brand-900 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              Featured
            </button>

            <button
              type="button"
              onClick={() => setBulkOnly(!bulkOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1 ${
                bulkOnly
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3 h-3" /> Case / Bulk Tiers
            </button>
          </div>
        </div>

        {/* Reset Button */}
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Clear All
        </button>
      </div>

    </div>
  );
};
