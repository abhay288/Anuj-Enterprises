import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Star, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const QuickViewModal = () => {
  const { isQuickViewOpen, quickViewProduct, closeQuickView, addToCart, navigateTo } = useApp();
  const [qty, setQty] = useState(1);

  if (!isQuickViewOpen || !quickViewProduct) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col md:flex-row"
        >
          {/* Close button */}
          <button
            onClick={closeQuickView}
            className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Column - Image */}
          <div className="w-full md:w-1/2 bg-slate-50 dark:bg-slate-950 p-6 flex flex-col justify-between items-center relative border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-md bg-brand-900 text-white dark:bg-brand-600">
                {quickViewProduct.brand}
              </span>
              {quickViewProduct.isTrending && (
                <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-md bg-amber-500 text-white">
                  Trending
                </span>
              )}
            </div>

            <div className="w-full h-64 md:h-80 flex items-center justify-center p-4 my-auto">
              <img
                src={quickViewProduct.image}
                alt={quickViewProduct.name}
                className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>

            <div className="w-full text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
              <span>SKU: {quickViewProduct.sku}</span>
              <span>HSN Code: {quickViewProduct.hsn}</span>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
                <span>{quickViewProduct.category}</span>
                <span>•</span>
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="ml-1 font-semibold text-slate-700 dark:text-slate-300">{quickViewProduct.rating}</span>
                  <span className="ml-1 text-slate-400">({quickViewProduct.reviewCount})</span>
                </div>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-3">
                {quickViewProduct.name}
              </h2>

              <div className="mb-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-extrabold text-brand-900 dark:text-brand-400">
                    ₹{quickViewProduct.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-slate-400 line-through">
                    ₹{quickViewProduct.mrp.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {Math.round(((quickViewProduct.mrp - quickViewProduct.price) / quickViewProduct.mrp) * 100)}% OFF
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                  + {quickViewProduct.gstRate}% GST Applicable (Tax Invoice Provided)
                </span>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-6">
                {quickViewProduct.description}
              </p>

              {/* Bulk Tier Preview */}
              {quickViewProduct.bulkTiers && (
                <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                    B2B Tiered Volume Discounts
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {quickViewProduct.bulkTiers.map((tier, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                        <span className="text-[11px] text-slate-500 block">{tier.qty}</span>
                        <span className="text-xs font-bold text-brand-900 dark:text-brand-400">₹{tier.price.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-sm font-bold text-slate-900 dark:text-white min-w-[2.5rem] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => {
                    addToCart(quickViewProduct, qty);
                    closeQuickView();
                  }}
                  className="flex-1 bg-brand-900 hover:bg-brand-800 text-white dark:bg-brand-600 dark:hover:bg-brand-500 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-900/20 transition-all hover:scale-[1.02]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Bulk Cart
                </button>
              </div>

              <button
                onClick={() => {
                  closeQuickView();
                  navigateTo('product-detail', quickViewProduct.id);
                }}
                className="w-full py-2 text-xs font-semibold text-brand-900 dark:text-brand-400 hover:underline flex items-center justify-center gap-1"
              >
                View Full Technical Specifications & Warranty Details <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
