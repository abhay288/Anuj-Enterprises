import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye, Sparkles, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ProductCard = memo(({ product }) => {
  const { addToCart, openQuickView, navigateTo, t } = useApp();
  const [quantity, setQuantity] = useState(1);

  const handleQtyInputChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val <= 0) {
      setQuantity('');
    } else {
      setQuantity(val);
    }
  };

  const handleQtyInputBlur = () => {
    if (!quantity || quantity < 1) {
      setQuantity(1);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
    >
      {/* Top Image Area */}
      <div className="relative p-4 bg-slate-50/80 dark:bg-slate-950/60 overflow-hidden flex items-center justify-center h-52 border-b border-slate-100 dark:border-slate-800/80">
        
        {/* Brand & New/Featured Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
          <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-brand-950 text-white dark:bg-brand-600 shadow">
            {product.brand}
          </span>

          {product.isNew ? (
            <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-amber-400 text-slate-950 shadow flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> {t('new_arrival', 'NEW ARRIVAL')}
            </span>
          ) : product.isFeatured ? (
            <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-emerald-500 text-white shadow">
              {t('featured', 'FEATURED')}
            </span>
          ) : null}
        </div>

        {/* Top Right Badges & Actions */}
        <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5">
          {product.isNrp && (
            <div className="group/nrp relative">
              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md flex items-center gap-1 cursor-help border border-rose-400/30 hover:scale-105 transition-transform">
                <ShieldAlert className="w-2.5 h-2.5" /> NRP
              </span>
              {/* Tooltip on Hover */}
              <div className="absolute right-0 top-full mt-1.5 w-52 p-2.5 bg-slate-950 text-white text-[10px] rounded-xl shadow-2xl border border-rose-500/40 opacity-0 group-hover/nrp:opacity-100 transition-all duration-200 pointer-events-none z-30 leading-tight">
                <div className="flex items-center gap-1 text-rose-400 mb-1 font-extrabold text-[10px]">
                  <ShieldAlert className="w-3 h-3" /> No Return Policy
                </div>
                This product follows No Return Policy. Please inspect the product carefully at the time of delivery.
              </div>
            </div>
          )}

          {/* Quick View Top-Right Mobile Touch Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openQuickView(product);
            }}
            className="p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl shadow backdrop-blur-sm transition-all sm:hidden active:scale-95"
            title={t('quick_view', 'Quick View')}
          >
            <Eye className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        {/* Product Image */}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="max-h-44 max-w-full object-contain group-hover:scale-105 transition-transform duration-500 cursor-pointer"
          onClick={() => navigateTo('product-detail', product.id)}
        />

        {/* Quick View Overlay Button for Hover Screens */}
        <div className="absolute inset-x-4 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex gap-2">
          <button
            onClick={() => openQuickView(product)}
            className="w-full py-2 bg-slate-900/90 text-white dark:bg-slate-800/90 backdrop-blur-md rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg hover:bg-brand-900 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> {t('quick_view', 'Quick View')}
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
            <span>SKU: <strong className="text-slate-700 dark:text-slate-300 font-mono">{product.sku}</strong></span>
          </div>

          <h3 
            onClick={() => navigateTo('product-detail', product.id)}
            className="text-sm font-bold text-slate-900 dark:text-white hover:text-brand-900 dark:hover:text-brand-400 cursor-pointer line-clamp-2 leading-snug mb-2"
          >
            {product.name}
          </h3>

          {/* Pack / Bundle / Case Information Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[10px] text-slate-600 dark:text-slate-300">
            {product.packSize && (
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 font-medium">
                {t('pack_size', 'Pack')}: <strong className="text-slate-900 dark:text-white">{product.packSize}</strong>
              </span>
            )}
            {product.bundleSize && (
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 font-medium">
                {t('bundle_size', 'Bundle')}: <strong className="text-slate-900 dark:text-white">{product.bundleSize}</strong>
              </span>
            )}
            {product.caseSize && (
              <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 rounded-md border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 font-bold">
                {t('case_size', 'Case')}: {product.caseSize}
              </span>
            )}
          </div>
        </div>

        {/* Action Trigger */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {/* Interactive Quantity Selector with Direct Typing */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 pl-2">{t('quantity', 'Quantity')}:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, (parseInt(quantity) || 1) - 1))}
                className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-sm text-sm"
              >
                -
              </button>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min="1"
                value={quantity}
                onChange={handleQtyInputChange}
                onBlur={handleQtyInputBlur}
                className="w-14 h-8 sm:h-7 text-center text-xs font-extrabold bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setQuantity((parseInt(quantity) || 0) + 1)}
                className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-sm text-sm"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={() => addToCart(product, parseInt(quantity) || 1)}
            className="w-full py-2.5 px-4 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow transition-all bg-brand-900 hover:bg-brand-800 text-white dark:bg-brand-600 dark:hover:bg-brand-500"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{t('add_to_cart', 'Add to Cart')}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';
