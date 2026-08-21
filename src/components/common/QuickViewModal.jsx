import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Star, ArrowRight, Check, Box, Sparkles, Building2, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const QuickViewModal = () => {
  const { isQuickViewOpen, quickViewProduct, closeQuickView, addToCart, navigateTo } = useApp();
  const [qty, setQty] = useState(1);

  if (!isQuickViewOpen || !quickViewProduct) return null;

  const handleQtyInput = (e) => {
    const val = parseInt(e.target.value, 10);
    setQty(isNaN(val) || val <= 0 ? '' : val);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col md:flex-row"
        >
          {/* Close button */}
          <button
            onClick={closeQuickView}
            className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Column - Product Image & Identification */}
          <div className="w-full md:w-1/2 bg-slate-50 dark:bg-slate-950 p-6 flex flex-col justify-between items-center relative border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
            <div className="absolute top-4 left-4 flex flex-col gap-1 items-start">
              <span className="px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider rounded-lg bg-brand-950 text-white dark:bg-brand-600 shadow">
                {quickViewProduct.brand}
              </span>
              {quickViewProduct.isNew && (
                <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-amber-400 text-slate-950 flex items-center gap-0.5 shadow">
                  <Sparkles className="w-2.5 h-2.5" /> NEW ARRIVAL
                </span>
              )}
            </div>

            <div className="w-full h-60 md:h-72 flex items-center justify-center p-4 my-auto">
              <img
                src={quickViewProduct.image}
                alt={quickViewProduct.name}
                className="max-h-full max-w-full object-contain cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => {
                  closeQuickView();
                  navigateTo('product-detail', quickViewProduct.id);
                }}
              />
            </div>

            <div className="w-full text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
              <span>SKU: <strong className="text-slate-700 dark:text-slate-300 font-mono">{quickViewProduct.sku}</strong></span>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">{quickViewProduct.brand}</span>
            </div>
          </div>

          {/* Right Column - Comprehensive B2B Product Info */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto space-y-4">
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                <span>{quickViewProduct.category}</span>
              </div>

              <h2 
                onClick={() => {
                  closeQuickView();
                  navigateTo('product-detail', quickViewProduct.id);
                }}
                className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white leading-snug cursor-pointer hover:text-brand-900 transition-colors mb-3"
              >
                {quickViewProduct.name}
              </h2>

              {/* Pack, Bundle, Case Specification Grid */}
              <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-semibold">Pack</span>
                  <strong className="text-slate-900 dark:text-white">{quickViewProduct.packSize || '1 Unit'}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-semibold">Bundle</span>
                  <strong className="text-slate-900 dark:text-white">{quickViewProduct.bundleSize || '5 Units'}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-900 text-amber-900 dark:text-amber-300">
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-bold">Case</span>
                  <strong className="font-black">{quickViewProduct.caseSize || '10 Units'}</strong>
                </div>
              </div>

              {/* Live Stock Strip */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 mb-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Inventory Status</span>
                <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-[11px] rounded-lg inline-flex items-center gap-1">
                  <Check className="w-3 h-3" /> In Stock ({quickViewProduct.stock} units)
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                {quickViewProduct.description}
              </p>
            </div>

            {/* Quantity Selector & Quick Actions */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Order Quantity:</span>
                <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(1, (parseInt(qty) || 1) - 1))}
                    className="px-3 py-1.5 font-extrabold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={handleQtyInput}
                    onBlur={() => (!qty || qty < 1) && setQty(1)}
                    className="w-14 py-1.5 font-bold text-xs text-center bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-x border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setQty((parseInt(qty) || 0) + 1)}
                    className="px-3 py-1.5 font-extrabold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    addToCart(quickViewProduct, parseInt(qty) || 1);
                    closeQuickView();
                  }}
                  className="flex-1 py-3 px-4 bg-brand-900 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-500 text-white font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Order Cart
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  closeQuickView();
                  navigateTo('product-detail', quickViewProduct.id);
                }}
                className="w-full py-1.5 text-xs font-bold text-brand-900 dark:text-amber-400 hover:underline flex items-center justify-center gap-1"
              >
                <span>View Full Product Specifications & Margin Table</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
