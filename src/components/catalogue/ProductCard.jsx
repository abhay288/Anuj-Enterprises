import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye, Star, Sparkles, Box, AlertTriangle, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ProductCard = ({ product }) => {
  const { addToCart, openQuickView, navigateTo } = useApp();
  const [quantity, setQuantity] = useState(1);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= (product.lowStockThreshold || 20);

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
      whileHover={{ y: isOutOfStock ? 0 : -6 }}
      className={`group relative rounded-2xl bg-white dark:bg-slate-900 border ${
        isOutOfStock 
          ? 'border-red-200 dark:border-red-950/60 opacity-90' 
          : 'border-slate-200 dark:border-slate-800'
      } shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden`}
    >
      {/* Top Image Area */}
      <div className="relative p-4 bg-slate-50/80 dark:bg-slate-950/60 overflow-hidden flex items-center justify-center h-52 border-b border-slate-100 dark:border-slate-800/80">
        
        {/* Brand & New/Featured/Stock Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
          <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-brand-950 text-white dark:bg-brand-600 shadow">
            {product.brand}
          </span>

          {isOutOfStock ? (
            <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-red-600 text-white shadow flex items-center gap-1">
              <XCircle className="w-2.5 h-2.5" /> OUT OF STOCK
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-amber-500 text-slate-950 shadow flex items-center gap-1">
              <AlertTriangle className="w-2.5 h-2.5" /> LOW STOCK
            </span>
          ) : product.isNew ? (
            <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-amber-400 text-slate-950 shadow flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> NEW ARRIVAL
            </span>
          ) : product.isFeatured ? (
            <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-emerald-500 text-white shadow">
              FEATURED
            </span>
          ) : null}
        </div>

        {/* Product Image */}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className={`max-h-44 max-w-full object-contain ${
            isOutOfStock ? 'grayscale opacity-75' : 'group-hover:scale-105'
          } transition-transform duration-500 cursor-pointer`}
          onClick={() => navigateTo('product-detail', product.id)}
        />

        {/* Quick View Overlay Button */}
        <div className="absolute inset-x-4 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
          <button
            onClick={() => openQuickView(product)}
            className="w-full py-2 bg-slate-900/90 text-white dark:bg-slate-800/90 backdrop-blur-md rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg hover:bg-brand-900 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Quick View
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
            <span>SKU: <strong className="text-slate-700 dark:text-slate-300 font-mono">{product.sku}</strong></span>
            <span>
              Stock: {isOutOfStock ? (
                <strong className="text-red-600 font-bold">0 units (Depleted)</strong>
              ) : isLowStock ? (
                <strong className="text-amber-600 font-bold">{product.stock} units left</strong>
              ) : (
                <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{product.stock} units</strong>
              )}
            </span>
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
                Pack: <strong className="text-slate-900 dark:text-white">{product.packSize}</strong>
              </span>
            )}
            {product.bundleSize && (
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 font-medium">
                Bundle: <strong className="text-slate-900 dark:text-white">{product.bundleSize}</strong>
              </span>
            )}
            {product.caseSize && (
              <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 rounded-md border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 font-bold">
                Case: {product.caseSize}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-amber-500 mb-3">
            <Star className="w-3.5 h-3.5 fill-amber-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200">{product.rating || 5.0}</span>
            <span className="text-slate-400">({product.reviewCount || 10} reviews)</span>
          </div>
        </div>

        {/* Action Trigger */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {/* Interactive Quantity Selector with Direct Typing */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 pl-2">Quantity:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => setQuantity(Math.max(1, (parseInt(quantity) || 1) - 1))}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-sm text-sm disabled:opacity-50"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                disabled={isOutOfStock}
                value={quantity}
                onChange={handleQtyInputChange}
                onBlur={handleQtyInputBlur}
                className="w-14 h-7 text-center text-xs font-extrabold bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
              />
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => setQuantity((parseInt(quantity) || 0) + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-sm text-sm disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={() => !isOutOfStock && addToCart(product, parseInt(quantity) || 1)}
            disabled={isOutOfStock}
            className={`w-full py-2.5 px-4 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow transition-all ${
              isOutOfStock
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-300 dark:border-slate-700'
                : 'bg-brand-900 hover:bg-brand-800 text-white dark:bg-brand-600 dark:hover:bg-brand-500'
            }`}
          >
            {isOutOfStock ? (
              <span>Out of Stock — Restocking Soon</span>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
