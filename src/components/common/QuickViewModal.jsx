import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ShoppingCart, ArrowRight, Sparkles, ShieldAlert, 
  ChevronLeft, ChevronRight, Layers, ArrowLeftRight 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const QuickViewModal = () => {
  const { 
    isQuickViewOpen, 
    quickViewProduct, 
    openQuickView, 
    closeQuickView, 
    addToCart, 
    navigateTo, 
    products = [], 
    t 
  } = useApp();
  
  const [qty, setQty] = useState(1);

  // Find index of current product in catalogue
  const currentIndex = useMemo(() => {
    if (!quickViewProduct || !products.length) return -1;
    return products.findIndex(p => p.id === quickViewProduct.id);
  }, [quickViewProduct, products]);

  const totalProducts = products.length;

  const handlePrevProduct = () => {
    if (!products.length || currentIndex === -1) return;
    const prevIdx = (currentIndex - 1 + products.length) % products.length;
    openQuickView(products[prevIdx]);
    setQty(1);
  };

  const handleNextProduct = () => {
    if (!products.length || currentIndex === -1) return;
    const nextIdx = (currentIndex + 1) % products.length;
    openQuickView(products[nextIdx]);
    setQty(1);
  };

  const handleSelectProduct = (productId) => {
    const target = products.find(p => p.id === productId);
    if (target) {
      openQuickView(target);
      setQty(1);
    }
  };

  // Keyboard Navigation: ArrowLeft for Prev, ArrowRight for Next, Escape to Close
  useEffect(() => {
    if (!isQuickViewOpen) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevProduct();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextProduct();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeQuickView();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickViewOpen, currentIndex, products]);

  if (!isQuickViewOpen || !quickViewProduct) return null;

  const handleQtyInput = (e) => {
    const val = parseInt(e.target.value, 10);
    setQty(isNaN(val) || val <= 0 ? '' : val);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/75 backdrop-blur-md">
        {/* Floating Prev Button (Desktop/Tablet) */}
        {totalProducts > 1 && (
          <button
            type="button"
            onClick={handlePrevProduct}
            className="hidden md:flex fixed left-4 lg:left-8 top-1/2 -translate-y-1/2 z-50 p-3.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white shadow-2xl border border-slate-200 dark:border-slate-700 hover:scale-110 hover:bg-amber-500 hover:text-slate-950 transition-all group items-center justify-center"
            title="Previous Product (Left Arrow Key)"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* Floating Next Button (Desktop/Tablet) */}
        {totalProducts > 1 && (
          <button
            type="button"
            onClick={handleNextProduct}
            className="hidden md:flex fixed right-4 lg:right-8 top-1/2 -translate-y-1/2 z-50 p-3.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white shadow-2xl border border-slate-200 dark:border-slate-700 hover:scale-110 hover:bg-amber-500 hover:text-slate-950 transition-all group items-center justify-center"
            title="Next Product (Right Arrow Key)"
          >
            <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}

        <motion.div
          key={quickViewProduct.id}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header Switcher & Close Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
            {/* Direct Product Switcher Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {totalProducts > 1 && (
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <button
                    type="button"
                    onClick={handlePrevProduct}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                    title="Previous Product"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 px-1 font-mono">
                    {currentIndex >= 0 ? currentIndex + 1 : 1} / {totalProducts}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextProduct}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                    title="Next Product"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Quick Jump Product Selector */}
              {totalProducts > 1 && (
                <div className="relative inline-flex items-center">
                  <select
                    value={quickViewProduct.id}
                    onChange={(e) => handleSelectProduct(e.target.value)}
                    className="text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500 max-w-[200px] sm:max-w-[300px] truncate shadow-sm cursor-pointer"
                  >
                    {products.map((p, idx) => (
                      <option key={p.id || idx} value={p.id}>
                        #{idx + 1}: {p.brand} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={closeQuickView}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Main Content Container */}
          <div className="overflow-y-auto flex flex-col md:flex-row flex-1">
            {/* Left Column - Product Image & Identification */}
            <div className="w-full md:w-1/2 bg-slate-50 dark:bg-slate-950 p-6 flex flex-col justify-between items-center relative border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
              <div className="w-full flex justify-between items-start mb-2">
                <div className="flex flex-col gap-1 items-start">
                  <span className="px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider rounded-lg bg-brand-950 text-white dark:bg-brand-600 shadow">
                    {quickViewProduct.brand}
                  </span>
                  {quickViewProduct.isNew && (
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-amber-400 text-slate-950 flex items-center gap-0.5 shadow">
                      <Sparkles className="w-2.5 h-2.5" /> NEW ARRIVAL
                    </span>
                  )}
                </div>

                {quickViewProduct.isNrp && (
                  <div className="relative group/nrp">
                    <span className="px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded-lg bg-rose-600 text-white shadow flex items-center gap-1 cursor-help border border-rose-400/30">
                      <ShieldAlert className="w-3.5 h-3.5" /> NRP
                    </span>
                    {/* Tooltip on Hover */}
                    <div className="absolute right-0 top-full mt-1.5 w-56 p-2.5 bg-slate-950 text-white text-[11px] font-medium rounded-xl shadow-2xl border border-rose-500/40 opacity-0 group-hover/nrp:opacity-100 transition-all pointer-events-none z-30 leading-snug">
                      <div className="flex items-center gap-1.5 text-rose-400 mb-0.5 font-extrabold text-xs">
                        <ShieldAlert className="w-3.5 h-3.5" /> No Return Policy
                      </div>
                      This product follows No Return Policy. Please inspect the product carefully at the time of delivery.
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full h-60 md:h-72 flex items-center justify-center p-4 my-auto relative group">
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

              {/* Bottom Quick Switch Controls for Mobile / Compact view */}
              <div className="w-full flex md:hidden items-center justify-between py-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handlePrevProduct}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm text-slate-700 dark:text-slate-300"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev Product
                </button>
                <button
                  type="button"
                  onClick={handleNextProduct}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm text-slate-700 dark:text-slate-300"
                >
                  Next Product <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-full text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
                <span>SKU: <strong className="text-slate-700 dark:text-slate-300 font-mono">{quickViewProduct.sku}</strong></span>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">{quickViewProduct.brand}</span>
              </div>
            </div>

            {/* Right Column - Comprehensive B2B Product Info */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  <span>{quickViewProduct.category}</span>
                </div>

                <h2 
                  onClick={() => {
                    closeQuickView();
                    navigateTo('product-detail', quickViewProduct.id);
                  }}
                  className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white leading-snug cursor-pointer hover:text-brand-900 dark:hover:text-amber-400 transition-colors mb-3"
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
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-semibold">Case</span>
                    <strong className="text-amber-800 dark:text-amber-300 font-extrabold">{quickViewProduct.caseSize || '10 Units'}</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                  {quickViewProduct.description}
                </p>
              </div>

              {/* Quick Add Action Controls */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Order Quantity:</span>
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
                    <button
                      type="button"
                      onClick={() => setQty(Math.max(1, (parseInt(qty) || 1) - 1))}
                      className="px-3 py-1.5 font-extrabold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
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

                {/* Custom B2B Quantity Presets */}
                <div className="flex items-center gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setQty(1)}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    1 Pack (1x)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQty(5)}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    1 Bundle (5x)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQty(10)}
                    className="px-2 py-1 bg-amber-400 text-slate-950 font-black rounded-lg hover:bg-amber-300"
                  >
                    1 Case (10x)
                  </button>
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
                    <ShoppingCart className="w-4 h-4" /> {t('add_to_cart', 'Add to Order Cart')}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      closeQuickView();
                      navigateTo('product-detail', quickViewProduct.id);
                    }}
                    className="py-1 text-xs font-bold text-brand-900 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>{t('view_details', 'View Full Specifications')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Direct Switch Next Link */}
                  {totalProducts > 1 && (
                    <button
                      type="button"
                      onClick={handleNextProduct}
                      className="py-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                    >
                      <span>Next SKU</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
